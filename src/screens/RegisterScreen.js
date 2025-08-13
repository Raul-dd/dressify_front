import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  StyleSheet, Image, Modal, Pressable, FlatList
} from 'react-native';
import API from '../api/axios';

const ROLES = [
  { label: 'Administrador', value: 'administrador' },
  { label: 'Consultor',     value: 'consultor' },
  { label: 'Vendedor',      value: 'vendedor' },
];

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState(ROLES[0].value); // valor por defecto: "vendedor"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openRoles, setOpenRoles] = useState(false);

  const selectedRoleLabel =
    ROLES.find(r => r.value === role)?.label ?? 'Selecciona un rol';

  const handleRegister = async () => {
    try {
      await API.post('/accounts', {
        name,
        email,
        password,
        password_confirmation: password,
        role, // "administrador" | "consultor" | "vendedor"
      });
      Alert.alert('¡Cuenta creada!', 'Ahora puedes verla en la lista de usuarios');
      navigation.goBack();
    } catch (error) {
      console.log(error?.response?.data || error.message);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstMessage = errors[firstKey][0];
        Alert.alert('Error de validación', firstMessage);
      } else if (error.response?.data?.message) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'No se pudo registrar');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Correo</Text>
      <TextInput
        placeholder="Gmail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Rol</Text>
      {/* Dropdown sin dependencias */}
      <Pressable style={styles.dropdown} onPress={() => setOpenRoles(true)}>
        <Text style={styles.dropdownText}>{selectedRoleLabel}</Text>
        <Text style={styles.dropdownCaret}>▾</Text>
      </Pressable>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      {/* Modal de opciones */}
      <Modal visible={openRoles} transparent animationType="fade" onRequestClose={() => setOpenRoles(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpenRoles(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Selecciona un rol</Text>
            <FlatList
              data={ROLES}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => {
                    setRole(item.value);
                    setOpenRoles(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {role === item.value && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'flex-start', alignItems:'center', padding:20, backgroundColor:'#fff', paddingTop:50 },
  logo:{ width:200, height:200, resizeMode:'contain', marginBottom:20 },
  label:{ alignSelf:'flex-start', marginLeft:50, fontSize:12, color:'#333', marginBottom:3 },
  input:{ width:'75%', backgroundColor:'#eee', padding:12, borderRadius:10, marginBottom:15, fontSize:14, borderWidth:1, borderColor:'#ddd' },

  dropdown:{ width:'75%', backgroundColor:'#eee', paddingVertical:12, paddingHorizontal:14,
             borderRadius:10, marginBottom:15, borderWidth:1, borderColor:'#ddd',
             flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  dropdownText:{ fontSize:14, color:'#111' },
  dropdownCaret:{ fontSize:16, color:'#555' },

  button:{ backgroundColor:'#000', paddingVertical:14, borderRadius:10, width:'75%', alignItems:'center', marginTop:10 },
  buttonText:{ color:'#fff', fontWeight:'bold', fontSize:16 },

  // Modal
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', alignItems:'center', padding:24 },
  sheet:{ width:'90%', maxWidth:420, backgroundColor:'#fff', borderRadius:14, padding:14, shadowColor:'#000',
          shadowOpacity:0.2, shadowRadius:10, elevation:6 },
  sheetTitle:{ fontSize:16, fontWeight:'600', marginBottom:8, color:'#111' },
  option:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
           paddingVertical:12, paddingHorizontal:10, borderRadius:10 },
  optionPressed:{ backgroundColor:'#f3f4f6' },
  optionText:{ fontSize:15, color:'#111' },
  optionCheck:{ fontSize:16, color:'#0a0' },
});
