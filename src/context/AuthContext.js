// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import API, { setAuthToken } from '../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user,  setUser]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem('@token'),
          AsyncStorage.getItem('@user'),
        ]);
        if (t) {
          setToken(t);
          await setAuthToken(t); // pone Authorization en axios
        }
        if (u) setUser(JSON.parse(u));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email, password) => {
    const { data } = await API.post('/login', { email, password });
    const t = data?.token;
    const u = data?.user;
    if (!t || !u) throw new Error('Respuesta inválida del servidor');

    await AsyncStorage.setItem('@token', t);
    await AsyncStorage.setItem('@user', JSON.stringify(u));
    await setAuthToken(t);

    setToken(t);
    setUser(u);
    setLoading(false);
    return u;
  };

  const signOut = async () => {
    await setAuthToken(null);
    await AsyncStorage.multiRemove(['@token', '@user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
