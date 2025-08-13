// screens/ChangePasswordScreen.js
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function ChangePasswordScreen() {
  const { user, token } = useAuth();
  const [form, setForm] = React.useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [saving, setSaving] = React.useState(false);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    if (!form.current_password || !form.new_password || !form.new_password_confirmation) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    if (form.new_password !== form.new_password_confirmation) {
      Alert.alert('Error', 'La confirmación no coincide con la nueva contraseña.');
      return;
    }
    try {
      setSaving(true);
      await API.patch(`/accounts/${user.id}/change-password`, {
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Éxito', 'Contraseña cambiada correctamente.');
    } catch (e) {
      console.log('change password error', e?.response?.data || e.message);
      const msg = e?.response?.data?.message || 'No se pudo cambiar la contraseña';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBar title="Cambiar contraseña" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Contraseña actual</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.current_password}
          onChangeText={(t) => updateField('current_password', t)}
        />

        <Text style={styles.label}>Nueva contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.new_password}
          onChangeText={(t) => updateField('new_password', t)}
        />

        <Text style={styles.label}>Confirmar nueva contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.new_password_confirmation}
          onChangeText={(t) => updateField('new_password_confirmation', t)}
        />

        <TouchableOpacity style={styles.button} onPress={onSave} disabled={saving}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 12, color: '#333', marginBottom: 3, marginTop: 10 },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
});
