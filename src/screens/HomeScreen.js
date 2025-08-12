import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { auth } = useAuth();
  const name = auth?.user?.name || 'Administrador';
  const fecha = new Date().toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Inicio" />
      <View style={styles.body}>
        <Text style={styles.title}>¡Bienvenido, {name}!</Text>
        <Text style={styles.date}>{fecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex:1, padding:16 },
  title: { fontSize:20, fontWeight:'700', marginBottom:8 },
  date: { color:'#666' },
});
