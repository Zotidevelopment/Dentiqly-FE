import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { apiClient } from '../lib/api-client';
import {
  identifyUser,
  resetUser,
  trackLogin,
  trackSignupCompleted,
} from '../lib/analytics';
import type { AuthUser, LoginData, SaasRegisterData } from '../types';

/**
 * Marca que la cuenta se creó en este navegador y todavía no volvió a entrar.
 * Sirve para distinguir el primer login real (el usuario regresó) del
 * auto-login que ocurre al terminar el registro.
 */
const FIRST_LOGIN_PENDING_KEY = 'dentiqly_first_login_pending';

/** Envía user_id y datos de la clínica al dataLayer. */
const identifyFromUser = (u: AuthUser) => {
  identifyUser({
    userId: u.id,
    clinicaId: u.clinicaId,
    clinicaSlug: u.clinica?.slug,
    role: u.role,
    plan: u.clinica?.subscription_status,
  });
};

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
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.me();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          identifyFromUser(userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          apiClient.clearToken();
          localStorage.removeItem('user');
        }
      } else if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/demo') || window.location.pathname === '/')) {
        // Usuario demo sintético: NO se identifica en analytics, si no cada
        // visitante anónimo de la landing entraría como el mismo user_id.
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

    const isFirstLogin = localStorage.getItem(FIRST_LOGIN_PENDING_KEY) === '1';
    if (isFirstLogin) localStorage.removeItem(FIRST_LOGIN_PENDING_KEY);
    identifyFromUser(userWithClinic);
    trackLogin('email', isFirstLogin);

    return response;
  };

  const register = async (data: SaasRegisterData) => {
    const response = await authApi.register(data);
    const userWithClinic: AuthUser = { ...response.user, clinica: response.clinica };
    setUser(userWithClinic);
    localStorage.setItem('user', JSON.stringify(userWithClinic));

    localStorage.setItem(FIRST_LOGIN_PENDING_KEY, '1');
    identifyFromUser(userWithClinic);
    trackSignupCompleted('email');

    return response;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('user');
    resetUser();
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
