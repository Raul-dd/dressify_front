import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.name}>{item?.name}</Text>
        <Text style={styles.id}>ID: {String(item?._id || item?.id || '').slice(-6)}</Text>
      </View>
      <Text style={styles.row}><Text style={styles.bold}>Rol:</Text> {item?.role}</Text>
      <Text style={styles.row}><Text style={styles.bold}>Correo:</Text> {item?.email}</Text>
      {!!item?.created_at && (
        <Text style={styles.row}>
          <Text style={styles.bold}>Registro:</Text> {String(item.created_at).substring(0,10)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f7f7f7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  name: { fontSize: 16, fontWeight: '600' },
  id: { fontSize: 12, color: '#666' },
  row: { marginTop: 4, color: '#444' },
  bold: { fontWeight: '600' },
});
