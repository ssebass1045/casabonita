// File: my-spa/src/auth/authContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';
import axios from 'axios';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
    children: React.ReactNode;
  }

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwt.decode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      const decodedToken: any = jwt.decode(token);
      setUser(decodedToken);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
