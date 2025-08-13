import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken, loadPersistedToken } from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, loading: true });

  useEffect(() => {
    (async () => {
      const token = await loadPersistedToken(); // Intenta cargar el token
      const userStr = await AsyncStorage.getItem('@user');
      const user = userStr ? JSON.parse(userStr) : null;
      setAuth({ token, user, loading: false });
    })();
  }, []);

  // src/context/AuthContext.js
  // src/context/AuthContext.js
  const signIn = async (email, password) => {
    try {
      const { data } = await API.post('/login', { email, password });

      // Obtenemos el token desde la respuesta de la API
      const token = data.token;  // El token debe venir del backend
      const user = data.user;

      // Guardamos el token y el usuario en AsyncStorage
      await AsyncStorage.setItem('@token', token);
      await AsyncStorage.setItem('@user', JSON.stringify(user));

      // Configuramos el token para futuras peticiones con axios
      await setAuthToken(token);

      // Actualizamos el estado con el token y el usuario
      setAuth({ token, user, loading: false });
    } catch (err) {
      console.log(err?.response?.data || err.message);
      throw new Error('Credenciales inválidas');
    }
  };


  const signOut = async () => {
    await setAuthToken(null);
    await AsyncStorage.removeItem('@user');
    setAuth({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, signOut, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
