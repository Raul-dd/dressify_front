// screens/UsersScreen.js
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import TopBar from '../components/TopBar';
import API from '../api/axios';
import UserCard from '../components/UserCard';
import FAB from '../components/FAB';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function UsersScreen() {
  const nav = useNavigation();
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [errText, setErrText] = useState('');

  const normalize = (arr = []) =>
    arr.map(u => ({
      ...u,
      id: String(u?.id ?? u?._id?.$oid ?? u?._id ?? ''),
      name: u?.name ?? '',
      email: u?.email ?? '',
      role: u?.role ?? '',
    }));

  const pickList = (data) =>
    Array.isArray(data)
      ? data
      : (data?.data?.data   // paginado: { data: { data: [...] } }
         ?? data?.data      // a veces sin paginación
         ?? data?.accounts  // alias
         ?? []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrText('');

      // Por si acaso, forzamos Authorization con el token actual
      const { data } = await API.get('/accounts', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const list = pickList(data);
      setUsers(normalize(list));
    } catch (e) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      console.log('fetch users error =>', status, body || e.message);

      if (status === 401) setErrText('No autorizado. Inicia sesión de nuevo.');
      else if (status === 403) setErrText('No tienes permisos para ver usuarios.');
      else setErrText('No se pudieron cargar los usuarios.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && token) fetchUsers();   // espera a tener token listo
    }, [authLoading, token])
  );

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Usuarios" />
      <View style={styles.container}>
        <Text style={styles.listTitle}>Lista de usuarios</Text>
        <FlatList
          data={users}
          keyExtractor={(item, idx) => item.id || String(idx)}
          renderItem={({ item }) => <UserCard item={item} />}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} />}
          ListEmptyComponent={
            !loading && (
              <Text style={{ textAlign:'center', color:'#666', marginTop:16 }}>
                {errText || 'No hay usuarios'}
              </Text>
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
  container: { flex:1, padding:16 },
  listTitle: {
    fontSize:16, fontWeight:'600', marginBottom:12,
    backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#ddd'
  },
});
