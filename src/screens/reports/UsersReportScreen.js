import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import API from '../../api/axios';
import FilterBox from '../../components/FilterBox'; // Ajusta la ruta si es necesario

export default function UsersReportScreen() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/accounts')
      .then(res => setUsers(res.data.data.data))
      .catch(err => console.error(err));
  }, []);

  const rolesCount = Object.values(
    users.reduce((acc, user) => {
        const role = user.role || 'Sin rol';
        if (!acc[role]) {
        acc[role] = { role, count: 0 };
        }
        acc[role].count += 1;
        return acc;
    }, {})
    );

    const mostRecentUser = users.reduce(
    (latest, current) =>
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest,
    users[0] || {}
    );

    const rolesList = Object.values(
    users.reduce((acc, user) => {
        if (user.role && !acc[user.role]) {
        acc[user.role] = { category_id: user.role, category_name: user.role.charAt(0).toUpperCase() + user.role.slice(1) };
        }
        return acc;
    }, {})
    );
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Reporte de usuarios</Text>
          <Image
            source={require('../../../assets/logo.png')} // o { uri: 'https://...' }
            style={styles.headerIcon}
          />
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <FilterBox
        categories={rolesList}
        onSelectCategory={setSelectedRole}
        selectedCategory={selectedRole}
        placeholder="Rol"
        />
        <View style={styles.horizontalContainer}>
          <View style={[styles.equalContainer,styles.totalContainer]}>
            <Text style={styles.totalNumber}>{users.length}</Text>
            <Text style={styles.totalText}>No. total de usuarios</Text>
          </View>
          <View style={[styles.equalContainer,styles.productsContainer]}>
            {mostRecentUser && mostRecentUser.name ? (
    <>
      <Text style={styles.productName}>{mostRecentUser.name}</Text>
      <Text style={styles.productTag}>Recien agregado</Text>
    </>
  ) : (
    <>
      <Text style={styles.productName}>Sin usuarios</Text>
      <Text style={styles.productTag}>-</Text>
    </>
  )}
          </View>
        </View>

        <View style={styles.categoriasContainer}>
          <Text style={styles.subtitle}>Usuarios por rol</Text>
          <View style={styles.categoriasHorizontalContainer}>
            {rolesCount.map(roleObj => (
                <View key={roleObj.role} style={[styles.equalContainer2, styles.unitContainer]}>
                <Text style={styles.categoryNumber}>{roleObj.count}</Text>
                <Text style={styles.categoryName}>{roleObj.role.charAt(0).toUpperCase() + roleObj.role.slice(1)}</Text>
                </View>
            ))}
          </View>
        </View>

        <View style={styles.productsDetailContainer}>
          <Text style={styles.subtitle}>Lista de usuarios</Text>
          {users
  .filter(user =>
    !selectedRole || user.role === selectedRole?.category_id
  )
  .map(user => (
    <View key={user.id} style={[styles.equalContainer3, styles.unitContainerProduct]}>
      <View style={styles.textLeft}>
        <Text style={styles.productNameDetail}>{user.name}</Text>
        <Text style={styles.categoryNameDetail}>Rol: {user.role}</Text>
        <Text style={styles.stockNameDetail}>Correo: {user.email}</Text>
      </View>
      <View style={styles.textRight}>
        <Text style={styles.codDetail}>ID:{"\n"}{user.id}</Text>
        <Text style={styles.priceDetail}>
          Fecha: {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },

  header: { 
    backgroundColor: '#D9D9D9', 
    padding: 10, 
    paddingStart: 25,
    borderBottomWidth: 1,         // Grosor del borde inferior
    borderBottomColor: '#000000'
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Alinea verticalmente
  },

  headerIcon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
    marginRight: 8, // Espacio entre imagen y texto
  },

  headerText: { 
    color: '#070707', 
    fontSize: 23,  
    fontFamily: 'Inter',
    textAlign: 'left',
    fontWeight: '100',
  },

  content: { 
    flex: 1, 
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 6,
    width: '100%',
  },

  equalContainer: {
    flex: 1,      
    maxWidth: '45%',         // Ocupan igual ancho
    marginHorizontal: 5,    // Espacio entre ellos
    minHeight: 120,        // Altura mínima garantizada (ajusta según necesidad)
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center', // Centrado vertical del contenido
    alignSelf: 'stretch',
  },

  totalContainer: {
    marginBottom: 20,
    borderWidth: 1,         // Grosor del borde inferior
    borderColor: '#000000',
    padding: 20,
    borderRadius: 10,
  },

  totalNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color:'#111111',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  totalText: {
    fontSize: 13,
    color: '#4B4B4B',
    fontWeight: 'light',
    fontFamily: 'Inter',
  },

  productContainer: {
    marginBottom: 20,
    borderWidth: 1,         // Grosor del borde inferior
    borderColor: '#000000',
    padding: 20,
    borderRadius: 10,
  },

  productName: {
    fontSize: 17,
    fontWeight: 'bold',
    color:'#111111',
    marginBottom: 8,
    fontFamily: 'Inter',
  },

  productTag: {
    fontSize: 13,
    color: '#4B4B4B',
    fontWeight: 'light',
    fontFamily: 'Inter',
  },

  categoriasContainer: {
    flexDirection: 'column', // Esto es por defecto, pero lo especificamos para claridad
    marginBottom: 25,
    marginHorizontal: 5, // Espacio entre items
    borderWidth: 1,         // Grosor del borde inferior
    borderColor: '#000000',
    padding: 15,
    borderRadius: 10,
  },
  
  subtitle: {
    fontSize: 14,
    fontWeight: 'regular',
    marginStart: 5,
    marginBottom: 10, // Espacio entre el título y los items
    color: '#4B4B4B',
    fontFamily: 'Inter',
  },

  categoriasHorizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribuye el espacio entre items
    width: '100%',
  },

  equalContainer2: {
    flex: 1, // Esto hace que ocupen el mismo espacio
    marginHorizontal: 8, // Espacio entre items
    minWidth: '20%',
    maxHeight: 90, // Altura mínima para que se vea bien
  },

  unitContainer: {
    backgroundColor: '#eeeeeeff',
    borderRadius: 8,
    padding: 12,
    // Centrado completo:
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center',     // Centrado horizontal
    aspectRatio: 1,           // Opcional: mantiene relación cuadrada
    height: 80,  
  },

  categoryNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color:'#313131ff',
    marginBottom: 5,
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  categoryName: {
    fontSize: 12,
    color: '#4B4B4B',
    fontWeight: 'light',
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  productsContainer: {
    marginBottom: 20,
    borderWidth: 1,         // Grosor del borde inferior
    borderColor: '#000000',
    padding: 20,
    borderRadius: 10,
  },

  productsDetailContainer: {
    flexDirection: 'column', // Esto es por defecto, pero lo especificamos para claridad
    marginBottom: 25,
    margin: 5, // Espacio entre items
    borderWidth: 1,         // Grosor del borde inferior
    borderColor: '#000000',
    borderRadius: 10,
    padding: 10,
  },

  equalContainer3: {
    marginHorizontal: 10, // Espacio entre items
  },

  unitContainerProduct: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Alinea verticalmente
    backgroundColor: '#eeeeeeff',
    borderRadius: 8,
    padding: 15,
    // Centrado completo:
    height: 110,  
    marginBottom: 15, // Espacio entre items
  },

  textLeft: {
    alignItems: 'flex-start', // Alinea el texto a la izquierda
  },  

  textRight: {
    alignItems: 'flex-end',
  },

  productNameDetail: {
    fontSize: 15,
    fontWeight: 'regular',
    fontFamily: 'Inter',
    color: '#111111',
    marginBottom: 5,
  },

  categoryNameDetail: {
    fontSize: 12,
    color: '#222222ff',
    fontWeight: 'regular',
    marginBottom: 5,
    fontFamily: 'Inter',
  },

  stockNameDetail: {
    fontSize: 10,
    color: '#222222ff', 
    fontFamily: 'Inter',
  },

  codDetail:{
    fontSize: 10,
    color: '#222222ff', 
    textAlign: 'right',
    fontFamily: 'Inter',
    marginBottom: 5,
  },

  priceDetail: {
    fontSize: 12,
    color: '#282828',
    textAlign: 'right',
    fontFamily: 'Inter',
    fontWeight: 'regular',
  },

});