import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, ScrollView  } from 'react-native';
import API from '../../api/axios'; // Ajusta la ruta según tu estructura
import FilterBox from '../../components/FilterBox';

export default function ProductsReportScreen() {
    const [products, setProducts] = useState([]);
    //const [categoriesCount, setCategoriesCount] = useState([]); // Nuevo estado
    const categoriesCount = Object.values(
        products.reduce((acc, product) => {
            const catId = product.category?.id || 'uncategorized';
            const catName = product.category?.name || 'Sin catalogar';
            if (!acc[catId]) {
            acc[catId] = { category_id: catId, category_name: catName, product_count: 0 };
            }
            acc[catId].product_count += 1;
            return acc;
        }, {})
    );

    const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    API.get('/products')
        .then(res => setProducts(res.data.data))
        .catch(err => console.error(err));
    }, []);

    const totalProducts = products.length;
    const mostRecentProduct = products.reduce((latest, current) => {
    return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    }, products[0] || null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Reporte de productos</Text>
          <Image
            source={require('../../../assets/logo.png')} // o { uri: 'https://...' }
            style={styles.headerIcon}
          />
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <FilterBox 
        categories={categoriesCount} 
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        />
        <View style={styles.horizontalContainer}>
          <View style={[styles.equalContainer,styles.totalContainer]}>
            <Text style={styles.totalNumber}>{totalProducts}</Text>
            <Text style={styles.totalText}>No. total de productos</Text>
          </View>
          <View style={[styles.equalContainer,styles.productsContainer]}>
            {mostRecentProduct ? (
                <>
                <Text style={styles.productName}>{mostRecentProduct.name}</Text>
                <Text style={styles.productTag}>Recien agregado</Text>
                </>
            ) : (
                <>
                <Text style={styles.productName}>Sin productos</Text>
                <Text style={styles.productTag}>-</Text>
                </>
            )}
          </View>
        </View>

        <View style={styles.categoriasContainer}>
          <Text style={styles.subtitle}>Productos por categoria</Text>
          <View style={styles.categoriasHorizontalContainer}>
            {categoriesCount.map(cat => (
                <View key={cat.category_id} style={[styles.equalContainer2, styles.unitContainer]}>
                <Text style={styles.categoryNumber}>{cat.product_count}</Text>
                <Text style={styles.categoryName}>{cat.category_name?? 'Sin catalogar'}</Text>
                </View>
            ))}
          </View>
        </View>

        <View style={styles.productsDetailContainer}>
          <Text style={styles.subtitle}>Lista de productos</Text>
            {products
                .filter(product => {
                    if (!selectedCategory) return true;
                    if (selectedCategory.category_id === 'uncategorized') {
                    // Solo productos sin categoría asignada
                    return !product.category;
                    }
                    // Productos con la categoría seleccionada
                    return product.category?.id === selectedCategory.category_id;
                })
                .map(product => (
                    <View key={product.id} style={[styles.equalContainer3, styles.unitContainerProduct]}>
                    <View style={styles.textLeft}>
                        <Text style={styles.productNameDetail}>{product.name}</Text>
                        <Text style={styles.categoryNameDetail}>Categoria: {product.category?.name ?? 'Sin categoría'}</Text>
                        <Text style={styles.stockNameDetail}>Stock: {product.stock} piezas</Text>
                    </View>
                    <View style={styles.textRight}>
                        <Text style={styles.codDetail}>Código único:{"\n"}{product.code}</Text>
                        <Text style={styles.priceDetail}>${Number(product.price).toFixed(2)}</Text>
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
    flexWrap: 'wrap',
    fontFamily: 'Inter',
  },

  categoriasHorizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribuye el espacio entre items
    width: '100%',
    flexWrap: 'wrap',
  },

  equalContainer2: {
     // Esto hace que ocupen el mismo espacio
    marginHorizontal: 8, // Espacio entre items
    width: '28%', // Ancho mínimo para que se vea bien
    maxHeight: 90, // Altura mínima para que se vea bien
    marginBottom: 12,
    marginHorizontal: '2%',
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
    fontSize: 14,
    color: '#282828',
    textAlign: 'right',
    fontFamily: 'Inter',
    fontWeight: 'medium',
  },

});