// App.js
/*import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function Root() {
  const { loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <AppNavigator />; // <-- NO NavigationContainer aquí
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <Root />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
*/

//Prueba de Ventas
// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomTabs from './src/navigation/BottomTabs';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <BottomTabs initialTab="ventas" />
    </GestureHandlerRootView>
  );
}





