// screens/ProductsScreen.js
import React from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, Image,
  TouchableOpacity, Alert, Platform, ActionSheetIOS
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PER_PAGE = 1000;

export default function ProductsScreen() {
  const { token, loading: authLoading } = useAuth();
  const navigation = useNavigation();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errText, setErrText] = React.useState('');

  const IMG_BASE = React.useMemo(() => {
    const b = API.defaults.baseURL || '';
    return b.replace(/\/api\/?$/, '');
  }, []);

  const normalize = (arr = []) =>
    arr.map((p) => ({
      id: String(p?.id ?? p?._id?.$oid ?? p?._id ?? ''),
      name: p?.name ?? '',
      description: p?.description ?? '',
      price: Number(p?.price ?? 0),
      sale_price: p?.sale_price != null ? Number(p?.sale_price) : null,
      stock: Number(p?.stock ?? 0),
      code: p?.code ?? '',
      image_path: p?.image_path ?? '',
      brand: p?.brand ?? '',
    }));

  const pickList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.products?.data)) return data.products.data;
    if (data?.success && Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const fetchAll = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrText('');
      const { data } = await API.get(`/products?per_page=${PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = pickList(data);
      setItems(normalize(list));
    } catch (e) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      console.log('fetch products error =>', status, body || e.message);
      if (status === 401) setErrText('No autorizado. Inicia sesión de nuevo.');
      else if (status === 403) setErrText('No tienes permisos para ver productos.');
      else setErrText('No se pudieron cargar los productos.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(React.useCallback(() => {
    if (!authLoading && token) fetchAll();
  }, [authLoading, token, fetchAll]));

  const confirmDelete = (product) => {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que deseas eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteProduct(product),
        },
      ],
    );
  };

  const deleteProduct = async (product) => {
    try {
      await API.delete(`/products/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((p) => p.id !== product.id));
    } catch (e) {
      console.log('delete product error', e?.response?.data || e.message);
      Alert.alert('Error', 'No se pudo eliminar el producto.');
    }
  };

  const openMenu = (product) => {
    const onEdit = () => navigation.navigate('EditProduct', { product });
    const onDelete = () => confirmDelete(product);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Editar', 'Eliminar', 'Cancelar'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
          userInterfaceStyle: 'light',
        },
        (btn) => {
          if (btn === 0) onEdit();
          if (btn === 1) onDelete();
        }
      );
    } else {
      Alert.alert(
        product.name,
        undefined,
        [
          { text: 'Editar', onPress: onEdit },
          { text: 'Eliminar', style: 'destructive', onPress: onDelete },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const renderItem = ({ item }) => {
    const hasOffer = item.sale_price != null && item.sale_price < item.price;
    const imgUri =
      item.image_path
        ? (item.image_path.startsWith('http') ? item.image_path : `${IMG_BASE}${item.image_path}`)
        : null;

    return (
      <View style={styles.card}>
        <Image
          source={imgUri ? { uri: imgUri } : require('../../assets/adaptive-icon.png')}
          style={styles.thumb}
        />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:4 }}>
            {hasOffer ? (
              <>
                <Text style={styles.sale}>${item.sale_price.toFixed(2)}</Text>
                <Text style={styles.priceStriked}>${item.price.toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            )}
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            Stock: {item.stock ?? 0}  •  Código: {item.code || '—'}
          </Text>
          {item.brand ? <Text style={styles.meta} numberOfLines={1}>Marca: {item.brand}</Text> : null}
        </View>

        <TouchableOpacity onPress={() => openMenu(item)} style={styles.menuBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color="#444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Productos" />
      <View style={{ padding:16, flex:1 }}>
        <FlatList
          data={items}
          keyExtractor={(it, idx) => it.id || String(idx)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} />}
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign:'center', color:'#666', marginTop:16 }}>
                {errText || 'No hay productos'}
              </Text>
            )
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* FAB circular para crear producto */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CreateProduct')}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:'row',
    gap:12,
    padding:12,
    borderRadius:12,
    backgroundColor:'#f8f8f8',
    marginBottom:10,
    alignItems:'center',
  },
  thumb: { width:70, height:70, borderRadius:10, backgroundColor:'#e9e9e9' },
  name: { fontSize:16, fontWeight:'700', color:'#111' },
  price: { fontSize:15, fontWeight:'600', color:'#111' },
  sale: { fontSize:15, fontWeight:'700', color:'#c00' },
  priceStriked: { fontSize:13, color:'#999', textDecorationLine:'line-through' },
  meta: { fontSize:12, color:'#666', marginTop:2 },
  menuBtn: { padding:6, borderRadius:8 },

  // FAB
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
