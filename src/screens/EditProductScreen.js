// screens/EditProductScreen.js
import React from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditProductScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const { token } = useAuth();

  const original = params?.product || {};
  const [form, setForm] = React.useState({
    name: original.name || '',
    description: original.description || '',
    price: String(original.price ?? ''),
    sale_price: original.sale_price != null ? String(original.sale_price) : '',
    stock: String(original.stock ?? ''),
    code: original.code || '',
    image_path: original.image_path || '',
    brand: original.brand || '',
  });
  const [saving, setSaving] = React.useState(false);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price || 0),
        sale_price: form.sale_price === '' ? null : Number(form.sale_price),
        stock: Number(form.stock || 0),
        code: form.code,
        image_path: form.image_path,
        brand: form.brand,
      };

      await API.put(`/products/${original.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Éxito', 'Producto actualizado');
      navigation.goBack(); // al volver, ProductsScreen hace refresh por useFocusEffect
    } catch (e) {
      console.log('update product error', e?.response?.data || e.message);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex:1, backgroundColor:'#fff' }} contentContainerStyle={{ padding:16 }}>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={form.name} onChangeText={(t)=>updateField('name', t)} />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height:90 }]}
        value={form.description}
        onChangeText={(t)=>updateField('description', t)}
        multiline
      />

      <Text style={styles.label}>Precio</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={form.price} onChangeText={(t)=>updateField('price', t)} />

      <Text style={styles.label}>Precio oferta (opcional)</Text>
      <TextInput style={styles.input} keyboardType="decimal-pad" value={form.sale_price} onChangeText={(t)=>updateField('sale_price', t)} />

      <Text style={styles.label}>Stock</Text>
      <TextInput style={styles.input} keyboardType="number-pad" value={form.stock} onChangeText={(t)=>updateField('stock', t)} />

      <Text style={styles.label}>Código</Text>
      <TextInput style={styles.input} value={form.code} onChangeText={(t)=>updateField('code', t)} />

      <Text style={styles.label}>Ruta de imagen</Text>
      <TextInput style={styles.input} value={form.image_path} onChangeText={(t)=>updateField('image_path', t)} placeholder="/images/products/a.png" />

      <Text style={styles.label}>Marca</Text>
      <TextInput style={styles.input} value={form.brand} onChangeText={(t)=>updateField('brand', t)} />

      <TouchableOpacity style={[styles.btn, { backgroundColor:'#111' }]} onPress={onSave} disabled={saving}>
        <Text style={{ color:'#fff', fontWeight:'700' }}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label:{ fontSize:12, color:'#333', marginTop:10, marginBottom:4 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12, backgroundColor:'#fafafa' },
  btn:{ marginTop:16, paddingVertical:14, borderRadius:12, alignItems:'center' },
});
