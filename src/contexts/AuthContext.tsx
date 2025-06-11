import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences: {
    currency: string;
    theme: 'light' | 'dark' | 'system';
    dateFormat: string;
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateUserPreferences: (preferences: Partial<User['preferences']>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data for demo purposes
const DEMO_USER: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'admin',
  preferences: {
    currency: 'USD',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check for saved session on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('financeAppUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any email/password combination works
      // In a real app, this would validate credentials against a backend
      setUser(DEMO_USER);
      localStorage.setItem('financeAppUser', JSON.stringify(DEMO_USER));
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user based on the demo user but with the provided details
      const newUser = {
        ...DEMO_USER,
        name,
        email,
      };
      
      setUser(newUser);
      localStorage.setItem('financeAppUser', JSON.stringify(newUser));
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeAppUser');
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Password reset link sent to ${email}`);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password has been reset successfully');
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      toast.error('Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('financeAppUser', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (preferences: Partial<User['preferences']>) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        const updatedUser = {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          },
        };
        setUser(updatedUser);
        localStorage.setItem('financeAppUser', JSON.stringify(updatedUser));
        toast.success('Preferences updated successfully');
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    updateUserPreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};