
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, pass: string) => {
    const loggedInUser = await api.loginUser(username, pass);
    setUser(loggedInUser);
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    // We can also call an API logout endpoint here if needed
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
