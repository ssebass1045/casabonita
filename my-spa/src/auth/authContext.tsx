// File: my-spa/src/auth/authContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// 1. Define la URL base de tu API backend
const API_BASE_URL = 'http://localhost:3000'; // <-- Asegúrate que el puerto 3000 sea el de tu backend

// 2. Define la estructura esperada del payload del token JWT
interface DecodedToken {
  username: string;
  sub: number; // ID del usuario
  iat: number;
  exp: number;
}

// 3. Define la estructura del Context
interface AuthContextType {
  user: DecodedToken | null; // El usuario decodificado o null
  token: string | null;      // El token JWT crudo o null
  login: (username: string, password: string) => Promise<void>; // Función de login
  logout: () => void;      // Función de logout
}

// 4. Define las Props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// 5. Crea el Context
export const AuthContext = createContext<AuthContextType>(null!);

// 6. Crea el Provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token')); // Inicializa desde localStorage

  // 7. Efecto para validar el token al cargar la app
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        if (decodedToken.exp * 1000 > Date.now()) { // Verifica expiración
          setUser(decodedToken);
          // Configura Axios globalmente para enviar el token en futuras peticiones
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          // Token expirado
          logout(); // Limpia si está expirado
        }
      } catch (error) {
        console.error('Token inválido o expirado:', error);
        logout(); // Limpia si es inválido
      }
    } else {
      // Asegura que no haya cabecera de autorización si no hay token
      delete axios.defaults.headers.common['Authorization'];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Depende del estado 'token'

  // 8. Función de Login
  const login = async (username: string, password: string) => {
    try {
      // Llama al endpoint del backend con la URL completa
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
      const receivedToken = response.data.access_token;

      if (receivedToken) {
        localStorage.setItem('token', receivedToken); // Guarda en localStorage
        setToken(receivedToken); // Actualiza el estado del token (disparará useEffect)
        // No necesitamos llamar a setUser o axios.defaults aquí, useEffect lo hará
      } else {
        throw new Error("No se recibió token de acceso");
      }
    } catch (error) {
      console.error('Fallo el inicio de sesión:', error);
      logout(); // Limpia el estado en caso de error
      throw error; // Relanza el error para que el componente Login lo maneje
    }
  };

  // 9. Función de Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null); // Actualiza el estado del token a null (disparará useEffect)
    setUser(null); // Limpia el estado del usuario
    // useEffect se encargará de limpiar axios.defaults.headers
  };

  // 10. Provee el contexto
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
