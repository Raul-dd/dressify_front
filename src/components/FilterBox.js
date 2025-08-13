import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const FilterBox = ({ categories, onSelectCategory, selectedCategory, placeholder = 'Categoría' }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filtros</Text>
      
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={() => onSelectCategory(null)}
      >
        <Text style={styles.resetText}>Restablecer</Text>
      </TouchableOpacity>
      
      <View style={styles.categoryFilter}>
        <Text style={styles.categoryLabel}></Text>
        <View>
          <TouchableOpacity 
            style={styles.categoryDropdown}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.categorySelected}>
              {selectedCategory?.category_name || placeholder}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {modalVisible && (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={() => setModalVisible(false)}
              />
              <View style={styles.dropdownMenu}>
                {([{category_id: null, category_name: placeholder}, ...categories]).map((item, idx) =>
    idx === 0 ? (
      <View
        key="header"
        style={[styles.categoryItem, { backgroundColor: '#f0f0f0' }]}
      >
        <Text style={[styles.categoryItemText, { color: '#999', fontWeight: 'bold' }]}>
          {item.category_name}
        </Text>
      </View>
    ) : (
      <TouchableOpacity
        key={item.category_id ?? 'all'}
        style={[
          styles.categoryItem,
          selectedCategory?.category_id === item.category_id && styles.selectedCategoryItem
        ]}
        onPress={() => {
          onSelectCategory(item.category_id ? item : null);
          setModalVisible(false);
        }}
      >
        <Text style={styles.categoryItemText}>{item.category_name}</Text>
      </TouchableOpacity>
    )
  )}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'column',
    marginBottom: 25,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',

  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40, // ajusta según el alto del dropdown
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    zIndex: 1000,
    elevation: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 0,
    fontFamily: 'Inter',
  },
  resetButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  resetText: {
    fontSize: 12,
    color: '#4B4B4B',
    textDecorationLine: 'underline',
    fontFamily: 'Inter',
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#4B4B4B',
    fontFamily: 'Inter',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: '40%',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  categorySelected: {
    fontSize: 13,
    color: '#313131',
    fontFamily: 'Inter',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#4B4B4B',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  selectedCategoryItem: {
    backgroundColor: '#e0e0e0',
  },
  categoryItemText: {
    fontSize: 14,
    color: '#313131',
    fontFamily: 'Inter',
  },
});

export default FilterBox;