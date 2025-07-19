import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types
export interface User {
  id: number;
  username: string;
  nama_lengkap: string;
  role: 'admin' | 'operator';
  email?: string;
  no_hp?: string;
  aktif: boolean;
  last_login?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: { nama_lengkap: string; email?: string; no_hp?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  loading: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook untuk menggunakan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sipesda-deploy-backend.vercel.app/api'
  : 'http://localhost:5000/api';

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        
        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        // Validate token
        validateToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        clearAuthData();
      }
    }
    
    setLoading(false);
  }, []);

  // Validate token with backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/validate-token`, {}, {
        headers: { Authorization: `Bearer ${tokenToValidate}` }
      });
      
      if (response.data.valid) {
        setUser(response.data.user);
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      clearAuthData();
    }
  };

  // Clear authentication data
  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('demo_mode');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Login function
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Try backend login first
      try {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          username,
          password
        });

        const { token: newToken, user: userData } = response.data;

        // Save to state
        setToken(newToken);
        setUser(userData);

        // Save to localStorage
        localStorage.setItem('auth_token', newToken);
        localStorage.setItem('auth_user', JSON.stringify(userData));

        // Set default axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        console.log('Backend login successful:', userData.username, 'Role:', userData.role);
        return;
        
      } catch (backendError: any) {
        console.warn('Backend login failed, using frontend mode:', backendError);
        
        // Frontend-only mode for testing
        if (username === 'admin' && password === 'admin123') {
          const demoUser = {
            id: 1,
            username: 'admin',
            nama_lengkap: 'Administrator Demo',
            role: 'admin' as const,
            email: 'admin@sipesda.demo',
            no_hp: '08123456789',
            aktif: true
          };
          
          const demoToken = 'demo_token_' + Date.now();
          
          // Save to state
          setToken(demoToken);
          setUser(demoUser);

          // Save to localStorage
          localStorage.setItem('auth_token', demoToken);
          localStorage.setItem('auth_user', JSON.stringify(demoUser));
          localStorage.setItem('demo_mode', 'true');

          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;

          console.log('Frontend demo login successful:', demoUser.username, 'Role:', demoUser.role);
          return;
        }
        
        if (username === 'operator' && password === 'operator123') {
          const demoUser = {
            id: 2,
            username: 'operator',
            nama_lengkap: 'Operator Demo',
            role: 'operator' as const,
            email: 'operator@sipesda.demo',
            no_hp: '08123456788',
            aktif: true
          };
          
          const demoToken = 'demo_token_' + Date.now();
          
          // Save to state
          setToken(demoToken);
          setUser(demoUser);

          // Save to localStorage
          localStorage.setItem('auth_token', demoToken);
          localStorage.setItem('auth_user', JSON.stringify(demoUser));
          localStorage.setItem('demo_mode', 'true');

          // Set default axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;

          console.log('Frontend demo login successful:', demoUser.username, 'Role:', demoUser.role);
          return;
        }
        
        throw backendError; // Re-throw if not demo credentials
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Login gagal');
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server');
      } else {
        throw new Error(error.message || 'Terjadi kesalahan saat login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearAuthData();
    console.log('User logged out');
  };

  // Update profile function
  const updateProfile = async (profileData: { nama_lengkap: string; email?: string; no_hp?: string }): Promise<void> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user state with new data
      const updatedUser = response.data.user;
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      console.log('Profile updated successfully');
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Profile update failed');
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server');
      } else {
        throw new Error('Terjadi kesalahan saat update profile');
      }
    }
  };

  // Change password function
  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
      await axios.put(`${API_BASE_URL}/users/change-password`, {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Password changed successfully');
      
    } catch (error: any) {
      console.error('Change password error:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Password change failed');
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server');
      } else {
        throw new Error('Terjadi kesalahan saat mengubah password');
      }
    }
  };

  // Computed values
  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.role === 'admin';
  const isOperator = user?.role === 'operator';

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    isAdmin,
    isOperator,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk proteksi route berdasarkan role
export const useRoleAccess = () => {
  const { user, isAuthenticated, isAdmin, isOperator } = useAuth();

  const requireAuth = () => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
  };

  const requireAdmin = () => {
    requireAuth();
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  };

  const requireAdminOrOperator = () => {
    requireAuth();
    if (!isAdmin && !isOperator) {
      throw new Error('Admin or operator access required');
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isOperator,
    requireAuth,
    requireAdmin,
    requireAdminOrOperator
  };
}; 