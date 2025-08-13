// src/screens/Sales/RegisterSale.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, Image, TouchableOpacity, TextInput,
  FlatList, Modal, Pressable, ActivityIndicator, Alert
} from "react-native";
//import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import Constants from "expo-constants";
import { useNavigation } from '@react-navigation/native';

// --- API base desde app.json (ya incluye /api) ---
const RAW_BASE =
  (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBaseUrl) ||
  (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.apiBaseUrl) ||
  "";
const API_BASE = String(RAW_BASE).replace(/\/+$/, "");
const API = axios.create({
  baseURL: API_BASE,            // ej: http://192.168.1.72:8000/api
  timeout: 15000,
  headers: { Accept: "application/json" },
});

// --- helpers ---
const METHODS = [
  { id: "cash",     label: "Efectivo" },
  { id: "card",     label: "Tarjeta" },
  { id: "transfer", label: "Transferencia" },
];

const toId = (raw) => (typeof raw === "string" ? raw : raw?.$oid || raw?.oid || String(raw || ""));

export default function RegisterSale() {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);

  // products
  const [products, setProducts] = useState([]);
  const [prodSearch, setProdSearch] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [product, setProduct] = useState(null);

  // qty
  const [qty, setQty] = useState(1);

  // payment
  const [showMethods, setShowMethods] = useState(false);
  const [method, setMethod] = useState(null);

  // ===== cargar productos =====
  const loadProducts = useCallback(async () => {
    try {
      const res = await API.get(`/products`);
      const rows = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

      // normaliza y elimina duplicados
      const seen = new Set();
      const list = [];
      rows.forEach((p) => {
        const id = String(p?._id ?? p?.id ?? "");
        if (!id || seen.has(id)) return;
        seen.add(id);
        list.push({
          _id: id,
          name: String(p?.name ?? "Unnamed"),
          price: Number(p?.price ?? 0),
          sale_price: Number(p?.sale_price ?? 0),
        });
      });

      setProducts(list);
    } catch (e) {
      console.log("loadProducts error:", e?.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ===== totales =====
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const s = Number(product.sale_price || 0);
    const p = Number(product.price || 0);
    return s > 0 ? s : p;
  }, [product]);

  const subtotal = useMemo(() => +(unitPrice * qty).toFixed(2), [unitPrice, qty]);
  const tax      = useMemo(() => +(subtotal * 0.16).toFixed(2), [subtotal]); // 16%
  const total    = useMemo(() => +(subtotal + tax).toFixed(2), [subtotal, tax]);

  // ===== listas en modales =====
  const listForModal = useMemo(() => {
    const base = products;
    const q = prodSearch.trim().toLowerCase();
    return q ? base.filter(p => (p.name || "").toLowerCase().includes(q)) : base;
  }, [products, prodSearch]);

  const chooseProduct = (p) => { setProduct(p || null); setShowProducts(false); };
  const chooseMethod  = (m) => { setMethod(m); setShowMethods(false); };

  // ===== acciones =====
  const inc = () => setQty(q => Math.min(9999, q + 1));
  const dec = () => setQty(q => Math.max(1, q - 1));
  const onChangeQty = (v) => {
    const n = Number(v.replace(/[^\d]/g, ""));
    setQty(isNaN(n) || n <= 0 ? 1 : n);
  };

  const onConfirm = async () => {
    if (!product) return Alert.alert("Falta", "Selecciona un producto.");
    if (!method)  return Alert.alert("Falta", "Selecciona un método de pago.");

    try {
      setLoading(true);
      await API.post(`/sales`, {
        // seller_id: null, // si luego tienes usuario, lo mandas aquí
        payment_method: method.id,
        details: [{ product_id: product._id, quantity: qty }],
      });
      Alert.alert("Éxito", "Venta creada correctamente.");
      setProduct(null); setQty(1); setMethod(null);
      // Ajusta por el nombre de tu ruta: "HistorialSale" o "Ventas"
      navigation.navigate("HistorialSale");
    } catch (e) {
      console.log("create sale error:", e?.response?.data || e?.message);
      Alert.alert("Error", e?.response?.data?.message || "No se pudo crear la venta");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    setProduct(null); setQty(1); setMethod(null);
    navigation.goBack();
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.screen}>
      {/* AppBar */}
      <View style={styles.appbar}>
        <Text style={styles.appbarTitle}>Registrar Venta</Text>
        <Image source={require("../../../assets/logo.png")} style={styles.appbarLogo} />
      </View>

      {/* Card de formulario */}
      <View style={styles.formCard}>
        {/* Producto */}
        <Text style={styles.fieldLabel}>Producto</Text>
        <Pressable style={styles.select} onPress={() => setShowProducts(true)}>
          <Text style={styles.selectText}>{product?.name || "Selecciona producto"}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#111827" />
        </Pressable>

        {/* Cantidad */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Cantidad</Text>
        <View style={styles.qtyBox}>
          <TextInput
            keyboardType="number-pad"
            value={String(qty)}
            onChangeText={onChangeQty}
            placeholder="Ingresa cantidad"
            style={styles.qtyInput}
          />
          <View style={styles.qtyButtons}>
            <TouchableOpacity onPress={dec} style={styles.qtyBtn}>
              <Text>-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={inc} style={styles.qtyBtn}>
              <Text>＋</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Método de pago */}
        <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Método de Pago</Text>
        <Pressable style={styles.select} onPress={() => setShowMethods(true)}>
          <Text style={styles.selectText}>{method?.label || "Selecciona método"}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={22} color="#111827" />
        </Pressable>
      </View>

      {/* Totales */}
      <View style={styles.totalsCard}>
        <View style={styles.totRow}>
          <Text style={styles.totLabel}>Subtotal</Text>
          <Text style={styles.totValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.totRow}>
          <Text style={styles.totLabel}>IVA</Text>
          <Text style={styles.totValue}>{tax.toFixed(2)}</Text>
        </View>
        <View style={[styles.totRow, { marginTop: 8 }]}>
          <Text style={[styles.totLabel, { fontWeight: "700" }]}>Total</Text>
          <Text style={[styles.totValue, { fontWeight: "700" }]}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onConfirm}>
          <Text style={styles.btnPrimaryTxt}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onCancel}>
          <Text style={styles.btnGhostTxt}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Productos */}
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
              keyExtractor={(p, i) => p._id || String(i)}
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

      {/* Modal: Métodos */}
      <Modal visible={showMethods} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Método de pago</Text>
            {METHODS.map((m) => (
              <TouchableOpacity id={m.id} style={styles.itemRow} onPress={() => chooseMethod(m)}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // AppBar
  appbar: {
    height: 56, backgroundColor: "#e5e7eb",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#d1d5db",
  },
  appbarTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  appbarLogo: { width: 28, height: 28, resizeMode: "contain" },

  // Card formulario
  formCard: {
    margin: 16, padding: 14, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#d1d5db",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
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

  // Totales
  totalsCard: {
    marginHorizontal: 16, marginTop: 6, marginBottom: 8,
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "#d1d5db",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  totRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  totLabel: { color: "#111827" },
  totValue: { color: "#111827" },

  // Botones
  btnRow: { flexDirection: "row", gap: 12, marginHorizontal: 16, marginTop: 6 },
  btn: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#111" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "700" },
  btnGhost: { backgroundColor: "#9ca3af" },
  btnGhostTxt: { color: "#fff", fontWeight: "700" },

  // Modales
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 18 },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14 },
  modalTitle: { fontWeight: "700", fontSize: 16, marginBottom: 10 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchBox: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    paddingHorizontal: 10, marginBottom: 10, height: 42, justifyContent: "center",
  },
  itemRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e7eb" },
});
