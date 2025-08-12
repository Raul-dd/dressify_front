import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiBaseUrl || Constants.manifest?.extra?.apiBaseUrl,
  timeout: 15000,
});

// Adjunta/elimina token en headers y persiste en AsyncStorage
export const setAuthToken = async (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem('@token', token);
  } else {
    delete API.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem('@token');
  }
};

export const loadPersistedToken = async () => {
  const t = await AsyncStorage.getItem('@token');
  if (t) API.defaults.headers.common.Authorization = `Bearer ${t}`;
  return t;
};

export default API;
