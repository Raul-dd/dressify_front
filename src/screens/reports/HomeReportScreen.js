import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import API from '../../api/axios';

export default function HomeReportScreen() {
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [sales, setSales] = useState([]);
    useEffect(() => {
    const fetchData = async () => {
        try {
        const productsResponse = await API.get('/products');
        setProducts(productsResponse.data.data);
        
        const accountsResponse = await API.get('/accounts');
        setUsers(accountsResponse.data.data.data);

        const salesResponse = await API.get('/sales');
        setSales(salesResponse.data.data);

        } catch (err) {
        console.error(err);
        }
    };

  fetchData();
}, []);

    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = enero
    const currentYear = now.getFullYear();

    // Calculamos mes anterior (manejando el cambio de año)
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
    prevMonth = 11; // Diciembre
    prevYear--; // Año anterior
    }

    const totalMonetarioMesActual = sales
    .filter(sale => {
        const saleDate = new Date(sale.date);
        return (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
        );
    })
    .reduce((sum, sale) => sum + Number(sale.total), 0);

    const totalMonetarioMesAnterior = sales
    .filter(sale => {
        const saleDate = new Date(sale.date);
        return (
        saleDate.getMonth() === prevMonth &&
        saleDate.getFullYear() === prevYear
        );
    })
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Home</Text>
          <Image
            source={require('../../../assets/logo.png')} // o { uri: 'https://...' }
            style={styles.headerIcon}
          />
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.titleText}>¡Bienvenido, Consultor!</Text>
        <Text style={styles.subtitleText}>domingo, 20 de julio, 2025</Text>

        <View style={styles.horizontalContainer}>
          <View style={[styles.equalContainer,styles.totalContainer]}>
            <Text style={styles.totalNumber}>${totalMonetarioMesActual.toFixed(2)}</Text>
            <Text style={styles.totalText}>Ventas de este mes</Text>
          </View>
          <View style={[styles.equalContainer,styles.productContainer]}>
            <Text style={styles.productName}>{users.length}</Text>
            <Text style={styles.productTag}>Numero de usuarios</Text>
          </View>
        </View>
        <View style={styles.horizontalContainer}>
          <View style={[styles.equalContainer,styles.totalContainer]}>
            <Text style={styles.totalNumber}>${totalMonetarioMesAnterior.toFixed(2)}</Text>
            <Text style={styles.totalText}>Ventas del mes anterior</Text>
          </View>
          <View style={[styles.equalContainer,styles.productContainer]}>
            <Text style={styles.productName}>{products.length}</Text>
            <Text style={styles.productTag}>Productos en venta</Text>
          </View>
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

    titleText: {
        fontSize: 24,
        fontWeight: 'semibold',
        color: '#111111',
        marginBottom: 6,
        marginTop: 10,
        marginStart: 8,
        fontFamily: 'Inter',
    },

    subtitleText: {
        fontSize: 18,
        fontWeight: 'regular',
        color: '#111111',
        marginBottom: 40,
        marginStart: 8,
        fontFamily: 'Inter',
    },

  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 16,
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


});