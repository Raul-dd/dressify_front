import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import TopBar from '../components/TopBar';
import API from '../api/axios';
import UserCard from '../components/UserCard';
import FAB from '../components/FAB';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function UsersScreen() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/accounts'); // GET /api/accounts
      setUsers(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.log('fetch users error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Usuarios" />
      <View style={styles.container}>
        <Text style={styles.listTitle}>Lista de usuarios</Text>
        <FlatList
          data={users}
          keyExtractor={(item, idx) => String(item?._id || item?.id || idx)}
          renderItem={({ item }) => <UserCard item={item} />}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} />}
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
