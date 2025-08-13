import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function EditAccountScreen({ route, navigation }) {
  const { account } = route.params;
  const { token } = useAuth();
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email);
  const [role, setRole] = useState(account.role);

  const saveChanges = async () => {
    try {
      await API.put(`/accounts/${account.id}`, { name, email, role }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Éxito', 'Cuenta actualizada');
      navigation.goBack();
    } catch (err) {
      console.log(err?.response?.data || err.message);
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput value={name} onChangeText={setName} placeholder="Nombre" />
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={role} onChangeText={setRole} placeholder="Rol" />
      <Button title="Guardar cambios" onPress={saveChanges} />
    </View>
  );
}
