// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {
      await signIn(email.trim(), password);
      // No navegues manualmente: AppNavigator cambiará al stack según el rol
    } catch (err) {
      console.log(err?.response?.data || err.message);
      const msg = err?.response?.data?.message || 'Ocurrió un error al iniciar sesión';
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} />

      <Text style={styles.label}>Gmail</Text>
      <TextInput
        placeholder="Gmail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#666"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'flex-start', alignItems:'center', padding:20, backgroundColor:'#fff', paddingTop:100 },
  logo: { width:200, height:200, resizeMode:'contain', marginBottom:20 },
  label: { alignSelf:'flex-start', marginLeft:50, fontSize:12, color:'#333', marginBottom:3 },
  input: { width:'75%', backgroundColor:'#ddd', padding:12, borderRadius:10, marginBottom:15, fontSize:14 },
  button: { backgroundColor:'#000', paddingVertical:14, borderRadius:10, width:'75%', alignItems:'center', marginTop:10 },
  buttonText: { color:'#fff', fontWeight:'bold', fontSize:16 },
});
