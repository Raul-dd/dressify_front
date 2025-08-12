import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken, loadPersistedToken } from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, loading: true });

  useEffect(() => {
    (async () => {
      const token = await loadPersistedToken();
      const userStr = await AsyncStorage.getItem('@user');
      const user = userStr ? JSON.parse(userStr) : null;
      setAuth({ token, user, loading: false });
    })();
  }, []);

  const signIn = async (email, password) => {
    // ✅ Usa tu endpoint Laravel /api/login que devuelve token y user
    const { data } = await API.post('/login', { email, password });
    // Ajusta si tu backend usa otras keys (p.ej. access_token)
    const token = data.token || data.access_token;
    const user  = data.user  || data.account || null;

    await setAuthToken(token);
    await AsyncStorage.setItem('@user', JSON.stringify(user));
    setAuth({ token, user, loading: false });
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
