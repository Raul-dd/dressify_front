// src/screens/Sales/EditSale.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput,
  FlatList, Modal, ActivityIndicator, Alert
} from "react-native";
import axios from "axios";
import Constants from "expo-constants";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

// === API base desde app.json (ya incluye /api) ===
const RAW_BASE =
  (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBaseUrl) ||
  (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.apiBaseUrl) ||
  "";
const API_BASE = String(RAW_BASE).replace(/\/+$/, "");
const API = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// === helpers ===
const toId = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (raw.$oid) return raw.$oid;
  if (raw.oid) return raw.oid;
  return String(raw);
};
const normalizeDetails = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (typeof d === "string") { try { return JSON.parse(d); } catch { return []; } }
  return [];
};

// Métodos de pago (solo UI)
const METHODS = [
  { id: "cash",     label: "Efectivo" },
  { id: "card",     label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
];

// === helpers tiempo edición ===
const EDIT_WINDOW_MIN = 10;

const parseDate = (v) => {
  if (!v) return null;
  // intenta varias formas comunes
  const s = (typeof v === "string")
    ? v
    : (v?.date || v?.$date || v?.iso || v);
  const d = new Date(s);
  return isNaN(+d) ? null : d;
};

const secondsLeftFrom = (createdAt) => {
  if (!createdAt) return 0;
  const deadline = new Date(createdAt.getTime() + EDIT_WINDOW_MIN * 60 * 1000);
  return Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
};

export default function EditSale() {
  const navigation = useNavigation();
  const route = useRoute();
  const { saleId } = route.params || {};

  // estado loading
  const [loading, setLoading] = useState(true);

  // datos base
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);

  // selección de UI
  const [showProducts, setShowProducts] = useState(false);
  const [prodSearch, setProdSearch] = useState("");
  const [product, setProduct] = useState(null);

  const [qty, setQty] = useState(1);

  const [showMethods, setShowMethods] = useState(false);
  const [method, setMethod] = useState(null);

  // ventana de edición
  const [locked, setLocked] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0); // cuenta regresiva

  // ----- cargar productos (devuelve la lista también) -----
  const loadProducts = useCallback(async () => {
    const res = await API.get(`/products/names`);
    const rows = Array.isArray(res.data) ? res.data : (res.data && res.data.data) ? res.data.data : [];
    const mapped = rows.map((p) => ({
      _id: toId(p.id),
      name: String(p.name || "Unnamed"),
      price: Number(p.price ?? 0),
      sale_price: Number(p.sale_price ?? 0)
    }));
    setProducts(mapped);
    return mapped; // <- devolver para usar inmediatamente
  }, []);

  // Obtiene un saleId si no te pasaron uno
  const fetchAnySaleId = useCallback(async () => {
    const res = await API.get(`/sales?per_page=1&page=1`);
    const list = Array.isArray(res.data) ? res.data : (res.data && res.data.data) ? res.data.data : [];
    return list.length ? toId(list[0]._id) : null;
  }, []);

  // ----- cargar venta + precargar campos (devuelve product_id) -----
  const loadSale = useCallback(async (id) => {
    if (!id) return null;
    const res = await API.get(`/sales/${id}`);
    const doc = res.data && res.data.data ? res.data.data : res.data;
    setSale(doc);

    // ⏱️ ventana de edición
    const createdAt =
      parseDate(doc.created_at) ||
      parseDate(doc.createdAt) ||
      parseDate(doc.created_at_iso) ||
      parseDate(doc.createdAtIso);
    const left = secondsLeftFrom(createdAt);
    setSecsLeft(left);
    setLocked(left === 0);

    // método y cantidad
    const det = normalizeDetails(doc.details)[0] || {};
    const m = METHODS.find((x) => x.id === doc.payment_method) || null;
    setMethod(m);
    setQty(Number(det.quantity || 1));

    return String(det.product_id || "");
  }, []);

  // carga inicial
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const id = saleId || (await fetchAnySaleId());
        // cargamos en paralelo
        const [prodList, pid] = await Promise.all([
          loadProducts(),
          (async () => await loadSale(id))(),
        ]);
        // seleccionar producto usando la lista *devuelta* (no el estado)
        if (pid) {
          const found = prodList.find((p) => p._id === pid);
          if (found) setProduct(found);
        }
      } catch (e) {
        console.log("load error:", e?.response?.data || e?.message);
        Alert.alert("Error", "No se pudo cargar la venta/productos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAnySaleId, loadProducts, loadSale, saleId]);

  // si cambiaron products después, intenta enganchar el product_id
  useEffect(() => {
    if (!sale || product || !products.length) return;
    const det = normalizeDetails(sale.details)[0] || {};
    const pid = String(det.product_id || "");
    const found = products.find((p) => p._id === pid);
    if (found) setProduct(found);
  }, [products, sale, product]);

  // cuenta regresiva
  useEffect(() => {
    if (!sale) return;
    if (locked || secsLeft === 0) return;
    const int = setInterval(() => {
      setSecsLeft((s) => {
        const ns = Math.max(0, s - 1);
        if (ns === 0) setLocked(true);
        return ns;
      });
    }, 1000);
    return () => clearInterval(int);
  }, [sale, locked, secsLeft]);

  // ----- totales -----
  const unitPrice = useMemo(
    () => Number((product && (product.sale_price || product.price)) || 0),
    [product]
  );
  const subtotal = useMemo(() => +(unitPrice * qty).toFixed(2), [unitPrice, qty]);
  const tax = useMemo(() => +(subtotal * 0.16).toFixed(2), [subtotal]);
  const total = useMemo(() => +(subtotal + tax).toFixed(2), [subtotal, tax]);

  // ----- listados en modal -----
  const listForModal = useMemo(() => {
    const q = prodSearch.trim().toLowerCase();
    return q ? products.filter((p) => (p.name || "").toLowerCase().includes(q)) : products;
  }, [products, prodSearch]);

  const chooseProduct = (p) => { if (!locked) { setProduct(p); setShowProducts(false); } };
  const chooseMethod  = (m) => { if (!locked) { setMethod(m); setShowMethods(false); } };

  // ----- inputs cantidad -----
  const inc = () => !locked && setQty((q) => Math.min(9999, q + 1));
  const dec = () => !locked && setQty((q) => Math.max(1, q - 1));
  const onChangeQty = (v) => {
    if (locked) return;
    const n = Number((v || "").replace(/[^\d]/g, ""));
    setQty(!n || n <= 0 ? 1 : n);
  };

  const mmss = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  // ----- guardar -----
  const onSave = async () => {
    if (!sale) return;
    if (locked) {
      return Alert.alert("Bloqueado", `Solo puedes editar durante ${EDIT_WINDOW_MIN} minutos después de crear la venta.`);
    }
    if (!product) return Alert.alert("Falta", "Selecciona un producto.");
    if (!method) return Alert.alert("Falta", "Selecciona un método de pago.");

    try {
      setLoading(true);
      await API.put(`/sales/${toId(sale._id)}`, {
        payment_method: method.id,
        details: [{ product_id: product._id, quantity: qty }],
      });
      Alert.alert("Guardado", "Venta actualizada.");
      if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo actualizar la venta";

      // Si el backend ya valida el tiempo y devuelve 403/422, lo mostramos claro.
      if (e?.response?.status === 403 || e?.response?.status === 422) {
        Alert.alert(
          "No permitido",
          msg.toLowerCase().includes("tiempo") || msg.toLowerCase().includes("time")
            ? msg
            : `La edición está limitada a ${EDIT_WINDOW_MIN} minutos después de la venta.`
        );
        setLocked(true);
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* AppBar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Modificar Venta</Text>
        <Image source={require("../../../assets/logo.png")} style={styles.appbarLogo} />
      </View>

      {/* Banner ventana de edición */}
      {locked ? (
        <View style={[styles.lockBanner, { backgroundColor: "#fee2e2", borderColor: "#fecaca" }]}>
          <Text style={{ color: "#991b1b", fontWeight: "700" }}>
            Edición deshabilitada: han pasado más de {EDIT_WINDOW_MIN} min desde la venta.
          </Text>
        </View>
      ) : (
        <View style={[styles.lockBanner, { backgroundColor: "#ecfeff", borderColor: "#a5f3fc" }]}>
          <Text style={{ color: "#155e75" }}>
            Tiempo restante para editar: <Text style={{ fontWeight: "700" }}>{mmss(secsLeft)}</Text>
          </Text>
        </View>
      )}

      {/* ID Box */}
      <View style={styles.idBox}>
        <Text style={styles.idLabel}>ID Venta</Text>
        <Text style={styles.idValue}>
          {sale ? (sale.code ?? toId(sale._id ?? sale.id ?? sale.sale_id)) : ""}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Producto</Text>
        <TouchableOpacity
          style={[styles.select, locked && { opacity: 0.6 }]}
          onPress={() => !locked && setShowProducts(true)}
          disabled={locked}
        >
          <Text style={styles.selectText}>{(product && product.name) || "Selecciona producto"}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Cantidad</Text>
        <View style={[styles.qtyBox, locked && { opacity: 0.6 }]}>
          <TextInput
            keyboardType="number-pad"
            value={String(qty)}
            onChangeText={onChangeQty}
            placeholder="Ingresa cantidad"
            style={styles.qtyInput}
            editable={!locked}
          />
          <View style={styles.qtyButtons}>
            <TouchableOpacity onPress={dec} style={styles.qtyBtn} disabled={locked}><Text>−</Text></TouchableOpacity>
            <TouchableOpacity onPress={inc} style={styles.qtyBtn} disabled={locked}><Text>＋</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Método de Pago</Text>
        <TouchableOpacity
          style={[styles.select, locked && { opacity: 0.6 }]}
          onPress={() => !locked && setShowMethods(true)}
          disabled={locked}
        >
          <Text style={styles.selectText}>{(method && method.label) || "Selecciona método"}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Totales */}
      <View style={styles.totalsCard}>
        <View style={styles.totRow}><Text style={styles.totLabel}>Subtotal</Text><Text style={styles.totValue}>${subtotal.toFixed(2)}</Text></View>
        <View style={styles.totRow}><Text style={styles.totLabel}>IVA</Text><Text style={styles.totValue}>{tax.toFixed(2)}</Text></View>
        <View style={[styles.totRow, { marginTop: 8 }]}><Text style={[styles.totLabel, { fontWeight: "700" }]}>Total</Text><Text style={[styles.totValue, { fontWeight: "700" }]}>${total.toFixed(2)}</Text></View>
      </View>

      {/* Botones */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, locked && { opacity: 0.5 }]}
          onPress={onSave}
          disabled={locked}
        >
          <Text style={styles.btnPrimaryTxt}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost]}
          onPress={() => {
            if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
            else Alert.alert("Demo", "Sin navegación");
          }}
        >
          <Text style={styles.btnGhostTxt}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal productos */}
      <Modal visible={showProducts} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecciona producto</Text>
            <View style={styles.searchBox}>
              <TextInput
                placeholder="Buscar producto..."
                value={prodSearch}
                onChangeText={setProdSearch}
                style={{ flex: 1 }}
                autoFocus
              />
            </View>
            <FlatList
              data={listForModal}
              keyExtractor={(p, i) => p._id || `x-${i}`}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemRow} onPress={() => chooseProduct(item)}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: "center", color: "#666" }}>Sin productos</Text>}
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#111", alignSelf: "flex-end" }]}
              onPress={() => setShowProducts(false)}
            >
              <Text style={{ color: "#fff" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal métodos */}
      <Modal visible={showMethods} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Método de pago</Text>
            {METHODS.map((m) => (
              <TouchableOpacity key={m.id} style={styles.itemRow} onPress={() => chooseMethod(m)}>
                <Text>{m.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#111", alignSelf: "flex-end" }]}
              onPress={() => setShowMethods(false)}
            >
              <Text style={{ color: "#fff" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===== estilos =====
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  appbar: {
    height: 56, backgroundColor: "#e5e7eb",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d1d5db",
  },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  appbarLogo: { width: 28, height: 28, resizeMode: "contain" },

  lockBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },

  idBox: {
    marginHorizontal: 16, marginTop: 10, marginBottom: 8,
    backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: "#d1d5db",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  idLabel: { color: "#111827", fontWeight: "700" },
  idValue: { color: "#111827", fontWeight: "700" },

  formCard: {
    margin: 16, padding: 14, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#d1d5db",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  fieldLabel: { fontWeight: "700", color: "#111827", marginBottom: 8 },

  select: {
    backgroundColor: "#eef2f5", height: 44, borderRadius: 12,
    paddingHorizontal: 12, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  selectText: { flex: 1, color: "#111827" },

  qtyBox: {
    backgroundColor: "#eef2f5", height: 44, borderRadius: 12,
    paddingLeft: 12, paddingRight: 6, flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#e5e7eb",
  },
  qtyInput: { flex: 1, paddingVertical: 0, color: "#111827" },
  qtyButtons: { flexDirection: "row" },
  qtyBtn: {
    width: 36, height: 32, borderRadius: 8, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb", marginLeft: 8,
  },

  totalsCard: {
    marginHorizontal: 16, marginTop: 6, marginBottom: 8,
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#d1d5db",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  totRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  totLabel: { color: "#111827" },
  totValue: { color: "#111827" },

  btnRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 6 },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#111" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "700" },
  btnGhost: { backgroundColor: "#9ca3af" },
  btnGhostTxt: { color: "#fff", fontWeight: "700" },

  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 18 },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 10 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchBox: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, height: 42, justifyContent: "center" },
  itemRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
});
