import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function UserCard({ item, onDeleted }) {
  const { token } = useAuth();
  const nav = useNavigation();

  const handleOptions = () => {
    Alert.alert(
      'Opciones',
      `Usuario: ${item.name}`,
      [
        { text: 'Editar', onPress: () => nav.navigate('EditAccount', { account: item }) },
        {
          text: 'Eliminar',
          onPress: confirmDelete,
          style: 'destructive'
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Confirmar',
      '¿Seguro que deseas eliminar esta cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete }
      ]
    );
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/accounts/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onDeleted?.(item.id);
    } catch (err) {
      console.log('Error eliminando:', err?.response?.data || err.message);
      Alert.alert('Error', 'No se pudo eliminar la cuenta');
    }
  };

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>
      <TouchableOpacity onPress={handleOptions}>
        <Ionicons name="ellipsis-vertical" size={20} color="#555" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center'
  },
  name: { fontWeight: 'bold', fontSize: 16 },
  email: { color: '#666', fontSize: 14 },
  role: { color: '#999', fontSize: 12 }
});
