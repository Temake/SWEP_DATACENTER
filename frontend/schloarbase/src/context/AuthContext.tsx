import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, Role, type RegisterRequest } from '../types';

import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error,setError] = useState<string | null> ("")
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = apiService.getCurrentUser();
    if (currentUser && apiService.isAuthenticated()) {
      setUser(currentUser);
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      setUser(response.user);
  
    } catch (error: unknown) {
      if (error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data && 'detail' in error.response.data) {
          const detail = String(error.response.data.detail);
          setError(detail);
          setLoading(false);
         
      } else {
        console.log('An unknown error occurred during login.');
      }
      
    }
  console.error('Login failed');
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await apiService.register(userData);
      setUser(response.user);
    } catch (error) {
     if (error instanceof Error && 'response' in error ) if ( 
        typeof error.response === 'object' && error.response && 
        'data' in error.response && typeof error.response.data === 'object' && 
        error.response.data && 'detail' in error.response.data) {
          
          const details = error.response.data.detail as Array<{ msg: string }>;
          const err = details && details.length > 0 ? details[0].msg : String(error.response.data.detail)  
          setError(err);
          setLoading(false);
    }
      console.log(error);
    }
  };


  const logout = () => {
    apiService.logout();
    setUser(null);
    
  };

  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const value: AuthContextType = {
    user,
    login,
    error,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};