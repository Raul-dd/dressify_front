import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import FilterBoxSales from '../../components/FilterBoxSales';

export default function SalesReportScreen() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [filters, setFilters] = useState({
      today: false,
      month: null,
      year: null
    });

    const handleFilterChange = (newFilters) => {
      setFilters(newFilters);
    };

    useEffect(() => {
    API.get('/sales')
        .then(res => setSales(res.data.data)) // El array real está en data.data
        .catch(err => console.error(err));
    }, []);

    // Filtra las ventas cuando cambian los filtros o los datos
    useEffect(() => {
  let result = sales;

  // 1️⃣ Filtrar por hoy
  if (filters.today) {
    result = result.filter(sale => {
      const saleDate = new Date(sale.date);
      const today = new Date();
      return saleDate.getDate() === today.getDate() &&
             saleDate.getMonth() === today.getMonth() &&
             saleDate.getFullYear() === today.getFullYear();
    });
  }
  // 2️⃣ Mes sin año → mes + año actual
  else if (filters.month && !filters.year) {
    const currentYear = new Date().getFullYear();
    result = result.filter(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth() + 1;
      const saleYear = saleDate.getFullYear();
      return saleMonth === filters.month.id && saleYear === currentYear;
    });
  }
  // 3️⃣ Mes y año seleccionados
  else if (filters.month && filters.year) {
    result = result.filter(sale => {
      const saleDate = new Date(sale.date);
      const saleMonth = saleDate.getMonth() + 1;
      const saleYear = saleDate.getFullYear();
      return saleMonth === filters.month.id && saleYear === filters.year.id;
    });
  }
  // 4️⃣ Solo año
  else if (!filters.month && filters.year) {
    result = result.filter(sale => {
      const saleYear = new Date(sale.date).getFullYear();
      return saleYear === filters.year.id;
    });
  }

  setFilteredSales(result);
}, [filters, sales]);

    const productSales = {};
    sales.forEach(sale => {
    sale.details.forEach(detail => {
        if (!productSales[detail.product_id]) {
        productSales[detail.product_id] = {
            product_id: detail.product_id,
            name: detail.name,
            quantity: 0,
        };
        }
        productSales[detail.product_id].quantity += detail.quantity;
    });
    });

    // Convierte a array y ordena por cantidad descendente
    const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

    const totalMonetario = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Reporte de ventas</Text>
          <Image
            source={require('../../../assets/logo.png')} // o { uri: 'https://...' }
            style={styles.headerIcon}
          />
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <FilterBoxSales onFilterChange={handleFilterChange} />
        <View style={styles.horizontalContainer}>
          <View style={[styles.equalContainer,styles.totalContainer]}>
            <Text style={styles.totalNumber}>{sales.length}</Text>
            <Text style={styles.totalText}>No. total de ventas</Text>
          </View>
          <View style={[styles.equalContainer,styles.productsContainer]}>
            <Text style={styles.productName}>${totalMonetario.toFixed(2)}</Text>
            <Text style={styles.productTag}>Total monetario</Text>
          </View>
        </View>

        <View style={styles.categoriasContainer}>
          <Text style={styles.subtitle}>Productos mas vendidos</Text>
          <View style={styles.categoriasHorizontalContainer}>
            {topProducts.map(product => (
                <View key={product.product_id} style={[styles.equalContainer2, styles.unitContainer]}>
                <Text style={styles.categoryNumber}>{product.quantity} pz</Text>
                <Text style={styles.categoryName}>{product.name}</Text>
                </View>
            ))}
          </View>
        </View>

        <View style={styles.productsDetailContainer}>
  <Text style={styles.subtitle}>Historial de ventas</Text>
  
  {filteredSales.length > 0 ? (
    filteredSales.map(sale => (
      <View key={sale.id} style={[styles.equalContainer3, styles.unitContainerProduct]}>
        <View style={styles.textLeft}>
          <Text style={styles.productNameDetail}>
            {new Date(sale.date).toLocaleDateString('es-MX', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
          
          <Text style={styles.stockNameDetail}>
            Método de pago: {
              sale.payment_method === 'card' ? 'Tarjeta de crédito' : 
              sale.payment_method === 'transfer' ? 'Transferencia' : 
              sale.payment_method
            }
          </Text>
          
          <Text style={styles.stockNameDetail}>
            Estado: {sale.status === 'completed' ? 'Completado' : sale.status}
          </Text>
          
          <View style={{ marginTop: 8 }}>
            {sale.details && sale.details.length > 0 && (
              <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2 }}>
                Productos:
              </Text>
            )}
            
            {sale.details?.map(detail => (
              <Text key={detail.product_id} style={{ fontSize: 11, marginBottom: 1 }}>
                {detail.name} x{detail.quantity} - ${Number(detail.unitPrice).toFixed(2)}
              </Text>
            ))}
          </View>
        </View>
        
        <View style={styles.textRight}>
          <Text style={styles.codDetail}>
            Subtotal: ${Number(sale.subtotal).toFixed(2)}
          </Text>
          <Text style={styles.priceDetail}>
            ${Number(sale.total).toFixed(2)}
          </Text>
        </View>
      </View>
    ))
  ) : (
    <View style={styles.noResultsContainer}>
      <Text style={styles.noResultsText}>
        {filters.today ? 
          "No hay ventas registradas hoy" : 
          "No se encontraron ventas con los filtros seleccionados"
        }
      </Text>
    </View>
  )}
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
    minWidth: '20%', // Ancho mínimo para que se vea bien
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
    fontSize: 12,
    fontWeight: 'medium',
    color:'#313131ff',
    marginBottom: 3,
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  categoryName: {
    fontSize: 12,
    color: '#4B4B4B',
    fontWeight: 'regular',
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
    minHeight: 150,  
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
    marginBottom: 7,
  },

  categoryNameDetail: {
    fontSize: 12,
    color: '#222222ff',
    fontWeight: 'regular',
    marginBottom: 4,
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
    fontSize: 16,
    color: '#282828',
    textAlign: 'right',
    fontFamily: 'Inter',
    fontWeight: 'medium',
  },

});