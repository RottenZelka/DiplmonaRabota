import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JwtPayload, jwtDecode } from 'jwt-decode';
import TokenManager from '../utils/tokenManager';

export interface User {
  id: string;
  email: string;
  user_type: 'student' | 'school';
}

interface CustomJwtPayload extends JwtPayload {
  data: {
    user_id: string;
    email: string;
    user_type: 'student' | 'school';
  };
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check if token is valid
        if (!TokenManager.isTokenValid()) {
          clearAuthData();
          return;
        }

        // Get decoded token
        const decodedToken = TokenManager.getDecodedToken();
        if (!decodedToken) {
          clearAuthData();
          return;
        }

        // Validate user type
        if (!['student', 'school'].includes(decodedToken.data.user_type)) {
          console.error('Invalid user type in token');
          clearAuthData();
          return;
        }

        // Set user data
        const userData: User = {
          id: decodedToken.data.user_id,
          email: decodedToken.data.email,
          user_type: decodedToken.data.user_type as 'student' | 'school'
        };
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    try {
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      // Ensure both are cleared even if one fails
      TokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    try {
      clearAuthData();
    } catch (error) {
      console.error('Error during logout:', error);
      // Ensure both are cleared even if one fails
      clearAuthData();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, setIsAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
