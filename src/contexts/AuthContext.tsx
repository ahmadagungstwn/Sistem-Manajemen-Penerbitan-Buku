// File: src/contexts/AuthContext.tsx
// Context untuk autentikasi user

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/db/database';
import { User } from '@/db/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const foundUser = await db.users.get(username);
      
      if (foundUser && foundUser.password === password) {
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        
        // Log aktivitas
        await db.log_aktivitas.add({
          log_id: `LOG-${Date.now()}`,
          username: foundUser.username,
          aktivitas: 'Login ke sistem',
          waktu: new Date().toISOString()
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (user) {
      // Log aktivitas
      await db.log_aktivitas.add({
        log_id: `LOG-${Date.now()}`,
        username: user.username,
        aktivitas: 'Logout dari sistem',
        waktu: new Date().toISOString()
      });
    }
    
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
