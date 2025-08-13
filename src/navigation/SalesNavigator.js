// src/navigation/SalesNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HistorialSale from '../screens/Sales/HistorialSale';
import RegisterSale from '../screens/Sales/RegisterSale'; // crea placeholder si falta
import EditSale from '../screens/Sales/EditSale';

const Stack = createNativeStackNavigator();

export default function SalesNavigator() {
  // "independent" porque este nav vive dentro de tu BottomTabs casero
  return (
    <NavigationContainer independent>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HistorialSale" component={HistorialSale} />
        <Stack.Screen name="RegisterSale" component={RegisterSale} />
        <Stack.Screen name="EditSale" component={EditSale} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
