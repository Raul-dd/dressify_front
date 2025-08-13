// screens/CreateProductScreen.js
import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator, Image, Modal, Pressable, FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../components/TopBar';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// ====== CATEGORÍAS Y SUBCATEGORÍAS FIJAS (ROPA) ======
// Categorías fijas
export const CATEGORIES = [
  { id: 'mujer',   name: 'Mujer' },
  { id: 'hombre',  name: 'Hombre' },
  { id: 'kids',    name: 'Kids' },
  { id: 'babies',  name: 'Bebés' },
  { id: 'otros',   name: 'Otros' },
];

// Subcategorías fijas por categoría
export const SUBCATS = {
  mujer: [
    { id: 'blusas',     name: 'Blusas' },
    { id: 'sueteres',   name: 'Suéteres' },
    { id: 'jeans',      name: 'Jeans' },
    { id: 'vestidos',   name: 'Vestidos' },
    { id: 'abrigos',    name: 'Abrigos' },
    { id: 'accesorios', name: 'Accesorios' },
  ],
  hombre: [
    { id: 'playeras',   name: 'Playeras' },
    { id: 'camisas',    name: 'Camisas' },
    { id: 'sueteres',   name: 'Suéteres' },
    { id: 'jeans',      name: 'Jeans' },
    { id: 'pantalones', name: 'Pantalones' },
    { id: 'abrigos',    name: 'Abrigos' },
    { id: 'accesorios', name: 'Accesorios' },
  ],
  kids: [
    { id: 'playeras',   name: 'Playeras' },
    { id: 'camisas',    name: 'Camisas' },
    { id: 'sudaderas',  name: 'Sudaderas' },
    { id: 'vestidos',   name: 'Vestidos' },
    { id: 'jeans',      name: 'Jeans' },
    { id: 'pantalones', name: 'Pantalones' },
    { id: 'accesorios', name: 'Accesorios' },
  ],
  babies: [
    { id: 'mamelucos',  name: 'Mamelucos' },
    { id: 'bodies',     name: 'Bodies' },
    { id: 'conjuntos',  name: 'Conjuntos' },
    { id: 'pijamas',    name: 'Pijamas' },
    { id: 'gorritos',   name: 'Gorritos' },
    { id: 'accesorios', name: 'Accesorios' },
  ],
  otros: [
    { id: 'gorras',        name: 'Gorras' },
    { id: 'calcetines',    name: 'Calcetines' },
    { id: 'ropa_interior', name: 'Ropa interior' },
    { id: 'deportes',      name: 'Deportes' },
    { id: 'hogar',         name: 'Hogar' },
    { id: 'varios',        name: 'Varios' },
  ],
};


export default function CreateProductScreen() {
  const { token } = useAuth();
  const navigation = useNavigation();

  // Básicos
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [salePrice, setSalePrice] = React.useState('');
  const [stock, setStock] = React.useState('0');
  const [code, setCode] = React.useState('');
  const [brand, setBrand] = React.useState('');

  // Clasificación (desde constantes)
  const [categoryId, setCategoryId] = React.useState('');
  const [subcategoryId, setSubcategoryId] = React.useState('');

  // Dropdown modals
  const [openCat, setOpenCat] = React.useState(false);
  const [openSub, setOpenSub] = React.useState(false);

  // Imagen
  const [image, setImage] = React.useState(null); // { uri, name, type }

  // Otros
  const [colorsText, setColorsText] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const num = (v) => {
    const n = Number(String(v ?? '').replace(',', '.').trim());
    return Number.isFinite(n) ? n : 0;
  };
  const parseColors = (txt) =>
    String(txt || '').split(',').map(s => s.trim()).filter(Boolean);

  React.useEffect(() => {
    (async () => {
      try {
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch {}
    })();
  }, []);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    setImage({
      uri: asset.uri,
      name: asset.fileName || 'upload.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const onSave = async () => {
    if (!name.trim()) return Alert.alert('Validación', 'El nombre es obligatorio');
    if (!String(price).trim()) return Alert.alert('Validación', 'El precio es obligatorio');

    const colorsArr = parseColors(colorsText);

    try {
      setLoading(true);

      if (image) {
        // multipart con archivo
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('description', description.trim());
        fd.append('price', String(num(price)));
        if (String(salePrice).trim()) fd.append('sale_price', String(num(salePrice)));
        fd.append('stock', String(num(stock || 0)));
        if (code.trim())  fd.append('code', code.trim());
        if (brand.trim()) fd.append('brand', brand.trim());
        if (categoryId)   fd.append('category_id', categoryId);
        if (subcategoryId)fd.append('subcategory_id', subcategoryId);
        colorsArr.forEach((c, i) => fd.append(`colors[${i}]`, c));
        fd.append('image', image);

        await API.post('/products', fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // JSON sin archivo
        const payload = {
          name: name.trim(),
          description: description.trim(),
          price: num(price),
          sale_price: String(salePrice).trim() ? num(salePrice) : null,
          stock: String(stock).trim() ? num(stock) : 0,
          code: code.trim() || null,
          brand: brand.trim() || null,
          category_id: categoryId || null,
          subcategory_id: subcategoryId || null,
          colors: colorsArr,
        };
        await API.post('/products', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Alert.alert('Éxito', 'Producto creado correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log('create product error =>', e?.response?.data || e.message);
      const msg = e?.response?.data?.message || 'No se pudo crear el producto.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const subcats = categoryId ? (SUBCATS[categoryId] || []) : [];
  const catLabel = categoryId
    ? (CATEGORIES.find(c => c.id === categoryId)?.name || 'Selecciona categoría')
    : 'Selecciona categoría';
  const subLabel = subcategoryId
    ? (subcats.find(s => s.id === subcategoryId)?.name || 'Selecciona subcategoría')
    : 'Selecciona subcategoría';

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      <TopBar title="Nuevo producto" showBack />

      <ScrollView contentContainerStyle={styles.container}>
        <Section title="Datos básicos" />
        <L label="Nombre *" v={name} s={setName} ph="Ej. Pantalón Cargo" />
        <L label="Descripción" v={description} s={setDescription} ph="Descripción breve" multiline />
        <L label="Precio *" v={price} s={setPrice} ph="0.00" kb="decimal-pad" />
        <L label="Precio oferta" v={salePrice} s={setSalePrice} ph="0.00" kb="decimal-pad" />
        <L label="Stock" v={stock} s={setStock} ph="0" kb="number-pad" />
        <L label="Código" v={code} s={setCode} ph="SKU-0001" autoCap="characters" />
        <L label="Marca" v={brand} s={setBrand} ph="Ej. Bloom" />

        <Section title="Clasificación" />
        <Text style={styles.label}>Categoría</Text>
        <Pressable style={styles.dropdown} onPress={() => setOpenCat(true)}>
          <Text style={styles.dropdownText}>{catLabel}</Text>
          <Text style={styles.dropdownCaret}>▾</Text>
        </Pressable>

        <Text style={styles.label}>Subcategoría</Text>
        <Pressable
          style={[styles.dropdown, !categoryId && { opacity: 0.6 }]}
          onPress={() => categoryId && setOpenSub(true)}
        >
          <Text style={styles.dropdownText}>{subLabel}</Text>
          <Text style={styles.dropdownCaret}>▾</Text>
        </Pressable>

        <Section title="Imagen" />
        {image?.uri ? <Image source={{ uri: image.uri }} style={styles.preview} /> : null}
        <TouchableOpacity style={styles.grayBtn} onPress={pickImage}>
          <Text style={{ color:'#111', fontWeight:'600' }}>Elegir de galería</Text>
        </TouchableOpacity>

        <Section title="Atributos" />
        <L label="Colors (separados por comas)" v={colorsText} s={setColorsText} ph="Blue, Pink" autoCap="words" />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={onSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Categorías */}
      <Modal visible={openCat} transparent animationType="fade" onRequestClose={() => setOpenCat(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpenCat(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Selecciona categoría</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    setCategoryId(item.id);
                    setSubcategoryId(''); // reset subcat
                    setOpenCat(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                  {categoryId === item.id && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Modal Subcategorías */}
      <Modal visible={openSub} transparent animationType="fade" onRequestClose={() => setOpenSub(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpenSub(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Selecciona subcategoría</Text>
            <FlatList
              data={subcats}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    setSubcategoryId(item.id);
                    setOpenSub(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                  {subcategoryId === item.id && <Text style={styles.optionCheck}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ====== UI helpers ======
function L({ label, v, s, ph, kb, autoCap="sentences", multiline=false }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={v}
        onChangeText={s}
        placeholder={ph}
        placeholderTextColor="#777"
        keyboardType={kb}
        autoCapitalize={autoCap}
        multiline={multiline}
      />
    </>
  );
}
function Section({ title }) {
  return <Text style={styles.section}>{title}</Text>;
}

const styles = StyleSheet.create({
  container:{ padding:16, paddingBottom:40 },
  section:{ marginTop:10, marginBottom:6, color:'#111', fontWeight:'700' },
  label:{ fontSize:12, color:'#333', marginLeft:6, marginTop:8, marginBottom:4 },
  input:{
    backgroundColor:'#f1f1f1', borderRadius:10, paddingHorizontal:12, paddingVertical:12,
    borderWidth:1, borderColor:'#e1e1e1', color:'#111'
  },
  multiline:{ minHeight:90, textAlignVertical:'top' },
  button:{ marginTop:18, backgroundColor:'#111', borderRadius:12, paddingVertical:14, alignItems:'center' },
  buttonText:{ color:'#fff', fontWeight:'700', fontSize:16 },

  // Dropdown + modal
  dropdown:{ backgroundColor:'#f1f1f1', borderRadius:10, padding:12, borderWidth:1, borderColor:'#e1e1e1',
             flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  dropdownText:{ color:'#111' }, dropdownCaret:{ color:'#555', fontSize:16 },
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.35)', justifyContent:'center', alignItems:'center', padding:24 },
  sheet:{ width:'90%', maxWidth:420, backgroundColor:'#fff', borderRadius:14, padding:14, elevation:6 },
  sheetTitle:{ fontSize:16, fontWeight:'600', marginBottom:8, color:'#111' },
  option:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:10 },
  optionText:{ fontSize:15, color:'#111' }, optionCheck:{ fontSize:16, color:'#0a0' },

  // Imagen
  grayBtn:{ backgroundColor:'#e9e9e9', paddingVertical:12, paddingHorizontal:14, borderRadius:10, alignSelf:'flex-start' },
  preview:{ width:'100%', height:180, borderRadius:12, backgroundColor:'#f0f0f0', marginBottom:10 },
});
