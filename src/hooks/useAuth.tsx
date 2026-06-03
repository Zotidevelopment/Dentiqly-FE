import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { apiClient } from '../lib/api-client';
import type { AuthUser, LoginData, SaasRegisterData } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (data: LoginData) => Promise<any>;
  register: (data: SaasRegisterData) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
        setUser({
          id: 'demo-user-id',
          email: 'demo@dentiqly.com',
          nombre: 'Dr. Demóstenes',
          apellido: 'Mock',
          role: 'admin',
          clinicaId: 'demo-clinica-id',
          clinica: {
            id: 'demo-clinica-id',
            nombre: 'Clínica Dental Demo',
            slug: 'demo',
            subscription_status: 'active'
          }
        });
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.me();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('Failed to restore session:', error);
          apiClient.clearToken();
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    const response = await authApi.login(data);
    const userWithClinic: AuthUser = { ...response.user, clinica: response.clinica };
    setUser(userWithClinic);
    localStorage.setItem('user', JSON.stringify(userWithClinic));
    return response;
  };

  const register = async (data: SaasRegisterData) => {
    const response = await authApi.register(data);
    const userWithClinic: AuthUser = { ...response.user, clinica: response.clinica };
    setUser(userWithClinic);
    localStorage.setItem('user', JSON.stringify(userWithClinic));
    return response;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
