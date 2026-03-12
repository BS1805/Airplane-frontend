import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../../services/apiClient';

interface User {
  id: string;
  username: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'airplane_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (!token) return;
    // Example: decode or fetch current user with token
    // Replace with real "me" endpoint when your API is ready
    apiClient
      .get<User>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
      });
  }, [token]);

  const login = async (username: string, password: string) => {
    // Replace '/auth/login' with your ASP.NET Core login endpoint
    const res = await apiClient.post<{ token: string; user: User }>('/auth/login', {
      username,
      password
    });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem(STORAGE_KEY, res.data.token);
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

