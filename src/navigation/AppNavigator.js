// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import UsersScreen from '../screens/UsersScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditAccountScreen from '../screens/EditAccountScreen';
import EditProductScreen from '../screens/EditProductScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import CreateProductScreen from '../screens/CreateProductScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Inicio: 'home',
            Usuarios: 'people',
            Productos: 'cube',
            Perfil: 'person-circle',
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Usuarios" component={UsersScreen} />
      <Tab.Screen name="Productos" component={ProductsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // ⬇️ AHORA sí: token y loading vienen DIRECTO del contexto
  const { token } = useAuth();

  return (
    <Stack.Navigator>
      {!token ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrar Usuario' }} />
          <Stack.Screen name="EditAccount" component={EditAccountScreen} options={{ title: 'Editar cuenta' }} />
          <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title:'Editar producto' }} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{ title: 'Cambiar contraseña' }}
          />
          <Stack.Screen name="CreateProduct" component={CreateProductScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
