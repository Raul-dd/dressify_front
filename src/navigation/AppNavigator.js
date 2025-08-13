// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import AdminNavigator from './roles/AdminNavigator';
import ConsultorNavigator from './roles/ConsultorNavigator';
import VendedorNavigator from './roles/VendedorNavigator';

const Stack = createNativeStackNavigator();

const normalizeRole = (r) => {
  if (!r) return '';
  const x = String(r).toLowerCase().trim();
  if (x === 'admin' || x === 'administrador') return 'admin';
  if (x === 'consultor') return 'consultor';
  if (x === 'vendedor') return 'vendedor';
  return x;
};

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrar Usuario' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const role = normalizeRole(user?.role);

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === 'admin' ? (
        <AdminNavigator />
      ) : role === 'consultor' ? (
        <ConsultorNavigator />
      ) : (
        <VendedorNavigator />
      )}
    </NavigationContainer>
  );
}
