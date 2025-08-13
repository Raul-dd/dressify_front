// src/navigation/BottomTabs.js
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SalesNavigator from './SalesNavigator';        // ⬅️ usa el stack
import ProfileScreen from '../screens/ProfileScreen'; // placeholder si falta

const IconVentas  = () => <Text>🧾</Text>;
const IconPerfil  = () => <Text>👤</Text>;

export default function BottomTabs({ initialTab = 'ventas' }) {
  const [tab, setTab] = useState(initialTab);

  const tabs = useMemo(() => ([
    { id: 'ventas', label: 'Ventas', icon: IconVentas, component: SalesNavigator },
    { id: 'perfil', label: 'Perfil', icon: IconPerfil, component: ProfileScreen },
  ]), []);

  const Current = (tabs.find(t => t.id === tab) || tabs[0]).component;

  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <StatusBar translucent backgroundColor="#fff" barStyle="dark-content" />

      {/* Contenido de la pestaña actual */}
      <View style={styles.content}>
        <Current />
      </View>

      {/* Barra inferior */}
      <View style={styles.nav}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={styles.item}
              hitSlop={{ top:8, bottom:8, left:8, right:8 }}
            >
              <View style={[styles.btn, active && styles.btnActive]}>
                <View style={styles.icon}><Icon /></View>
                <Text style={[styles.text, active && styles.textActive]} numberOfLines={1}>
                  {t.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  item: { flex: 1, alignItems: 'center' },
  btn: { width:'100%', maxWidth:120, alignItems:'center', paddingVertical:8, paddingHorizontal:10, borderRadius:18 },
  btnActive: { backgroundColor:'#eef2f5' },
  icon: { marginBottom: 2 },
  text: { fontSize: 12, color: '#111' },
  textActive: { fontWeight: '700' },
});
