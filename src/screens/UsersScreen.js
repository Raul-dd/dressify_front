// screens/UsersScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import API from '../api/axios';
import FAB from '../components/FAB';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const PER_PAGE = 1000; // trae “todo” en una

export default function UsersScreen() {
  const nav = useNavigation();
  const { token, loading: authLoading } = useAuth();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [errText, setErrText] = React.useState('');

  // Normaliza id y campos básicos
  const normalize = (arr = []) =>
    arr.map((u) => ({
      ...u,
      id: String(u?.id ?? u?._id?.$oid ?? u?._id ?? ''),
      name: u?.name ?? '',
      email: u?.email ?? '',
      role: u?.role ?? '',
    }));

  // Tolera distintas formas de respuesta
  const pickList = (data) =>
    Array.isArray(data)
      ? data
      : (data?.data?.data   // paginado: { data: { data: [...] } }
         ?? data?.data      // sin paginación
         ?? data?.accounts  // alias backend
         ?? []);

  const fetchAll = React.useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrText('');

      const { data } = await API.get(`/accounts?per_page=${PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = pickList(data);
      setItems(normalize(list));
    } catch (e) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      console.log('fetch users error =>', status, body || e.message);

      if (status === 401) setErrText('No autorizado. Inicia sesión de nuevo.');
      else if (status === 403) setErrText('No tienes permisos para ver usuarios.');
      else setErrText('No se pudieron cargar los usuarios.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Carga inicial y cada vez que vuelves a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (!authLoading && token) {
        fetchAll();
      }
    }, [authLoading, token, fetchAll])
  );

  // ----- Acciones de fila -----
  const onPressOptions = (item) => {
    Alert.alert(
      'Opciones',
      `Usuario: ${item.name}`,
      [
        { text: 'Editar', onPress: () => nav.navigate('EditAccount', { account: item }) },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(item),
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar la cuenta "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => handleDelete(item.id) },
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Quita de la lista sin recargar todo
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.log('Error eliminando:', err?.response?.data || err.message);
      Alert.alert('Error', 'No se pudo eliminar la cuenta');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>

      <TouchableOpacity style={styles.menuBtn} onPress={() => onPressOptions(item)}>
        <Ionicons name="ellipsis-vertical" size={18} color="#555" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBar title="Usuarios" />
      <View style={styles.container}>
        <Text style={styles.listTitle}>Lista de usuarios</Text>

        <FlatList
          data={items}
          keyExtractor={(item, idx) => item.id || String(idx)}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} />}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>
                {errText || 'No hay usuarios'}
              </Text>
            ) : (
              <View style={{ padding: 16 }}>
                <ActivityIndicator />
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      <FAB onPress={() => nav.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
    gap: 8,
  },
  name: { fontWeight: '700', fontSize: 16, color: '#111' },
  email: { color: '#555', fontSize: 14, marginTop: 2 },
  role: { color: '#999', fontSize: 12, marginTop: 2 },
  menuBtn: { padding: 6, borderRadius: 8 },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 16 },
});
