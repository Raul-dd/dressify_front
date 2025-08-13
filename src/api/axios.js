// src/api/axios.js
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1) Resuelve la baseURL desde env/app.json.
//    - Emulador Android: reemplaza "localhost" por 10.0.2.2 automáticamente.
function resolveBaseUrl() {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants?.expoConfig?.extra?.apiBaseUrl ||
    Constants?.manifest?.extra?.apiBaseUrl ||
    'http://192.168.68.105:8000/api';

  if (Platform.OS === 'android' && fromEnv.includes('localhost')) {
    return fromEnv.replace('localhost', '10.0.2.2'); // emulador Android
  }
  return fromEnv;
}

const API = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// 2) Adjunta/elimina token en headers y persiste en AsyncStorage
export const setAuthToken = async (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem('@token', token);
  } else {
    delete API.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem('@token');
  }
};

// 3) Carga token guardado al iniciar la app
export const loadPersistedToken = async () => {
  const t = await AsyncStorage.getItem('@token');
  if (t) API.defaults.headers.common.Authorization = `Bearer ${t}`;
  return t;
};

export default API;
