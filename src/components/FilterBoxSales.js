import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const FilterBoxSales = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Sample data for months and years
  const months = [
    { id: 1, name: 'Enero' },
    { id: 2, name: 'Febrero' },
    { id: 3, name: 'Marzo' },
    { id: 4, name: 'Abril' },
    { id: 5, name: 'Mayo' },
    { id: 6, name: 'Junio' },
    { id: 7, name: 'Julio' },
    { id: 8, name: 'Agosto' },
    { id: 9, name: 'Septiembre' },
    { id: 10, name: 'Octubre' },
    { id: 11, name: 'Noviembre' },
    { id: 12, name: 'Diciembre' },
  ];

  const years = [
    { id: 2023, name: '2023' },
    { id: 2024, name: '2024' },
    { id: 2025, name: '2025' },
  ];
 const handleTodayPress = () => {
    const newFilter = activeFilter === 'today' ? null : 'today';
    setActiveFilter(newFilter);
    setSelectedMonth(null);
    setSelectedYear(null);
    onFilterChange({
      today: newFilter === 'today',
      month: null,
      year: null
    });
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setActiveFilter(null);
    setShowMonthDropdown(false);
    onFilterChange({
      today: false,
      month: month,
      year: selectedYear
    });
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
    onFilterChange({
      today: false,
      month: selectedMonth,
      year: year
    });
  };

  const resetFilters = () => {
    setActiveFilter(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    onFilterChange({
      today: false,
      month: null,
      year: null
    });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtros</Text>
      
      <View style={styles.filtersRow}>
        {/* Hoy (Today) button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'today' && styles.activeFilterButton
          ]}
          onPress={handleTodayPress}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'today' && styles.activeFilterButtonText
          ]}>
            Hoy
          </Text>
        </TouchableOpacity>

        {/* Mes (Month) dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedMonth && styles.activeFilterButton
            ]}
            onPress={() => {
              setShowMonthDropdown(!showMonthDropdown);
              setShowYearDropdown(false);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedMonth && styles.activeFilterButtonText
            ]}>
              {selectedMonth ? selectedMonth.name : 'Mes'}
            </Text>
          </TouchableOpacity>
          
          {showMonthDropdown && (
            <View style={styles.dropdownList}>
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled={true}>
              {months.map((month) => (
                <TouchableOpacity
                  key={month.id}
                  style={styles.dropdownItem}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text style={styles.dropdownItemText}>{month.name}</Text>
                </TouchableOpacity>
              ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Año (Year) dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedYear && styles.activeFilterButton
            ]}
            onPress={() => {
              setShowYearDropdown(!showYearDropdown);
              setShowMonthDropdown(false);
            }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedYear && styles.activeFilterButtonText
            ]}>
              {selectedYear ? selectedYear.name : 'Año'}
            </Text>
          </TouchableOpacity>
          
          {showYearDropdown && (
            <View style={styles.dropdownList}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year.id}
                  style={styles.dropdownItem}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text style={styles.dropdownItemText}>{year.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Reset button */}
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={resetFilters}
      >
        <Text style={styles.resetText}>Restablecer</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f8f8f8',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#4B4B4B',
    marginLeft: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 15,
    fontFamily: 'Inter',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#eeeeee',
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  activeFilterButton: {
    backgroundColor: '#e0e0e0',
    borderColor: '#999999',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#313131',
    fontFamily: 'Inter',
  },
  activeFilterButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 2,
    position: 'relative',
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
    zIndex: 100,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#313131',
    fontFamily: 'Inter',
  },
  resetButton: {
    alignSelf: 'flex-end',
  },
  resetText: {
    fontSize: 12,
    color: '#4B4B4B',
    textDecorationLine: 'underline',
    fontFamily: 'Inter',
  },
});

export default FilterBoxSales;