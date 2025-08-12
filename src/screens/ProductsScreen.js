import React from 'react';
import { View, Text } from 'react-native';
import TopBar from '../components/TopBar';

export default function ProductsScreen() {
  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Productos" />
      <View style={{ padding:16 }}>
        <Text>Pantalla de productos (pendiente de tu API de productos).</Text>
      </View>
    </View>
  );
}
