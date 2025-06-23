import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setAuthToken, getMyProfile } from '../services/api'; // Assuming getMyProfile is a function to get user data

interface User {
  id: number;
  name: string;
  // Add other user properties as needed, e.g., email if returned by /api/me
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (newToken: string, userData?: User) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      setAuthToken(currentToken);
      setToken(currentToken);
      getMyProfile()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Token might be invalid/expired
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (newToken: string, userData?: User) => {
    localStorage.setItem('authToken', newToken);
    setAuthToken(newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    } else {
      // If userData is not directly provided, fetch it
      try {
        const response = await getMyProfile();
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user profile after login:", error);
        // Handle error, maybe logout if profile fetch fails
        logout();
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, isLoading }}>
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
