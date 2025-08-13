// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function Root() {
  // opcional: si quieres bloquear toda la UI mientras el AuthContext carga
  const { loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
