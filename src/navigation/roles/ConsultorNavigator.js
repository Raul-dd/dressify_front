// src/navigation/roles/ConsultorNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeReportScreen from '../../screens/reports/HomeReportScreen';
import ProductsReportScreen from '../../screens/reports/ProductsReportScreen';
import SalesReportScreen from '../../screens/reports/SalesReportScreen';
import UsersReportScreen from '../../screens/reports/UsersReportScreen';
import ProfileScreen from '../../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function ConsultorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            Sales: 'stats-chart',
            Users: 'people',
            Products: 'cube',
            Profile: 'person-circle',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeReportScreen} />
      <Tab.Screen name="Sales" component={SalesReportScreen} />
      <Tab.Screen name="Users" component={UsersReportScreen} />
      <Tab.Screen name="Products" component={ProductsReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
