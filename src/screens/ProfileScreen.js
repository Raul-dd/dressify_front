// screens/ProfileScreen.js
import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();  // <-- antes: { auth, signOut }
  const navigation = useNavigation();  
  const u = user || {};

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Perfil" />
      <View style={styles.container}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?img=3' }} style={styles.avatar} />
        <Text style={styles.label}>Name</Text>
        <TextInput value={u.name || ''} editable={false} style={styles.input} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={u.email || ''} editable={false} style={styles.input} />
        <Text style={styles.label}>Role</Text>
        <TextInput value={u.role || ''} editable={false} style={styles.input} />

        <TouchableOpacity
          style={styles.link}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={{ color:'#333' }}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button,{ backgroundColor:'#000' }]} onPress={signOut}>
          <Text style={{ color:'#fff', fontWeight:'600' }}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, alignItems:'center', padding:20, paddingTop:30 },
  avatar:{ width:120, height:120, borderRadius:60, marginBottom:20 },
  label:{ alignSelf:'flex-start', marginLeft:50, fontSize:12, color:'#333', marginBottom:3 },
  input:{ width:'75%', backgroundColor:'#ddd', padding:12, borderRadius:10, marginBottom:15, fontSize:14, color:'#333' },
  link:{ marginTop:6, marginBottom:18 },
  button:{ paddingVertical:14, borderRadius:10, width:'75%', alignItems:'center' },
});
