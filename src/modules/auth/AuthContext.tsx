import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

interface User {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (empId: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'airplane_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  // When the app reloads and a token exists, treat the user as authenticated
  useEffect(() => {
    if (token && !user) {
      setUser({
        id: 'stored',
        username: 'operator'
      });
    }
  }, [token, user]);

  const login = async (empId: string, password: string) => {
    const numericEmpId = Number(empId);

    const res = await apiClient.post<LoginResponse>('/api/Auth/login', {
      empId: numericEmpId,
      password
    });

    const accessToken = res.data.accessToken;

    setToken(accessToken);
    setUser({
      id: String(numericEmpId),
      username: empId
    });
    localStorage.setItem(STORAGE_KEY, accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Attach token to apiClient whenever it changes
  useEffect(() => {
    apiClient.setAuthToken(token);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!token,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

