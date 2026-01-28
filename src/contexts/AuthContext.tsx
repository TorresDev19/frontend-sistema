import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, normalizeRole } from '@/types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const { token, role, username } = authService.getStoredAuth();
    if (token && role && username) {
      // Restore user from stored data
      setUser({
        id: 'stored',
        username: username,
        role: normalizeRole(role),
        createdAt: new Date(),
      });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const result = await authService.login({ username, password });

    if (result) {
      setUser({
        id: 'logged',
        username,
        role: normalizeRole(result.role),
        createdAt: new Date(),
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
