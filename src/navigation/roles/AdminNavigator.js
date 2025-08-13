// src/navigation/roles/AdminNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Pantallas admin (ya existen en tu carpeta screens)
import HomeScreen from '../../screens/HomeScreen';
import UsersScreen from '../../screens/UsersScreen';
import ProductsScreen from '../../screens/ProductsScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import EditAccountScreen from '../../screens/EditAccountScreen';
import EditProductScreen from '../../screens/EditProductScreen';
import ChangePasswordScreen from '../../screens/ChangePasswordScreen';
import CreateProductScreen from '../../screens/CreateProductScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
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

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="EditAccount" component={EditAccountScreen} options={{ title: 'Editar cuenta' }} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Editar producto' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Cambiar contraseña' }} />
      <Stack.Screen name="CreateProduct" component={CreateProductScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
