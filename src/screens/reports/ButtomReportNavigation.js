import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importa tus pantallas
import HomeReportScreen from './HomeReportScreen';
import SalesReportScreen from './SalesReportScreen';
import UsersReportScreen from './UsersReportScreen';
import ProductsReportScreen from './ProductsReportScreen';
import ProfileScreen from '../ProfileScreen';

// Componentes de íconos
const HomeIcon = () => <Text>🏠</Text>;
const SalesIcon = () => <Text>📈</Text>;
const UsersIcon = () => <Text>👥</Text>;
const ProductsIcon = () => <Text>📦</Text>;
const ProfileIcon = () => <Text>👤</Text>;

export default function ButtomReportNavigation() {
  const [currentScreen, setCurrentScreen] = useState('home');
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'sales', label: 'Sales', icon: 'stats-chart' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'products', label: 'Products', icon: 'cube' },
    { id: 'profile', label: 'Profile', icon: 'person-circle' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeReportScreen />;
      case 'sales': return <SalesReportScreen />;
      case 'users': return <UsersReportScreen />;
      case 'products': return <ProductsReportScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeReportScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      <View style={styles.navigation}>
        {menuItems.map((item) => {
          const isActive = currentScreen === item.id;
          
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setCurrentScreen(item.id)}
              style={styles.navItem}
            >
              <View style={[
                styles.navButtonContainer,
                isActive && styles.activeNavButtonContainer
              ]}>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={isActive ? 'gray' : 'gray'}
                  />
                </View>
                <Text style={styles.navText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#AFAFAF',
    backgroundColor: '#fff',
    height: 90
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '25%',
    
  },
  navButtonContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    width: '100%',
    maxWidth: '100%',
  },
  activeNavButtonContainer: {
    backgroundColor: '#E6E6E6',
    borderRadius: 20,
    maxWidth: '100%',
  },
  iconWrapper: {
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#000',
  },
});