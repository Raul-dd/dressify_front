// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ButtomReportNavigation from './src/screens/reports/ButtomReportNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
         <AuthProvider>
          <StatusBar barStyle="dark-content" />
          <AppNavigator />
        </AuthProvider> 
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
