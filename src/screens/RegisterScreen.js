import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import API from '../api/axios';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); // simple; puedes cambiar a Picker si quieres
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await API.post('/accounts', {
        name,
        email,
        password,
        password_confirmation: password,
        role, // 'admin' | 'manager' | 'user'
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
      <Text style={styles.label}>Name</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#666" />
      <Text style={styles.label}>Gmail</Text>
      <TextInput placeholder="Gmail" value={email} onChangeText={setEmail} style={styles.input} placeholderTextColor="#666" autoCapitalize="none" />
      <Text style={styles.label}>Password</Text>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} placeholderTextColor="#666" />
      <Text style={styles.label}>Role (admin/manager/user)</Text>
      <TextInput placeholder="user" value={role} onChangeText={setRole} style={styles.input} />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'flex-start', alignItems:'center', padding:20, backgroundColor:'#fff', paddingTop:50 },
  logo:{ width:200, height:200, resizeMode:'contain', marginBottom:20 },
  label:{ alignSelf:'flex-start', marginLeft:50, fontSize:12, color:'#333', marginBottom:3 },
  input:{ width:'75%', backgroundColor:'#ddd', padding:12, borderRadius:10, marginBottom:15, fontSize:14 },
  button:{ backgroundColor:'#000', paddingVertical:14, borderRadius:10, width:'75%', alignItems:'center', marginTop:10 },
  buttonText:{ color:'#fff', fontWeight:'bold', fontSize:16 },
});
