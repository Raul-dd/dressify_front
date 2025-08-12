import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function FAB({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.fab}>
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  plus: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
