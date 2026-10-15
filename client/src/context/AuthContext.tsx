import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  address?: string | null;
  apartment?: string | null;
  city?: string | null;
  postcode?: string | null;
  country?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authPromptMessage: string | null;
  openAuthModal: (mode?: 'login' | 'signup', promptMessage?: string) => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  updateProfile: (data: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    apartment?: string;
    city?: string;
    postcode?: string;
    country?: string;
  }) => Promise<{ success: boolean; message: string }>;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  registerWithCredentials: (
    email: string,
    password: string,
    confirmPassword?: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean; message: string }>;
  requestPasswordChange: () => Promise<{ success: boolean; message: string; devCode?: string }>;
  confirmPasswordChange: (code: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; message: string }>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string; previewLink?: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (payload: { email?: string; fullName?: string; googleId?: string; credential?: string }) => Promise<{ success: boolean; message: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// In development, backend runs on port 5000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('phantom_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  const openAuthModal = (mode: 'login' | 'signup' = 'login', promptMessage?: string) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(promptMessage || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
  };

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  const updateProfile = async (data: { fullName?: string; country?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, message: resData.message || 'Failed to update profile' };
      }
      setUser(resData.user);
      return { success: true, message: 'Profile updated successfully' };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server' };
    }
  };

  // Sync user to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('phantom_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('phantom_user');
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Check current session from backend on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          }
        } else if (res.status === 401) {
          // If server says 401, clear stored user
          setUser(null);
          localStorage.removeItem('phantom_user');
        }
      } catch {
        // Silently handle auth endpoint unavailability
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Login failed' };
      }
      setUser(data.user);
      closeAuthModal();
      return { success: true, message: data.message || 'Signed in successfully' };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  const registerWithCredentials = async (
    email: string,
    password: string,
    confirmPassword?: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, confirmPassword, firstName, lastName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      setUser(data.user);
      closeAuthModal();
      return { success: true, message: data.message || 'Account created successfully' };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  const requestPasswordChange = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/request-password-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to request security code' };
      }
      return { success: true, message: data.message, devCode: data.devCode };
    } catch {
      return { success: false, message: 'Unable to connect to authentication server.' };
    }
  };

  const confirmPasswordChange = async (code: string, newPassword: string, confirmPassword?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/confirm-password-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to change password' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Unable to connect to authentication server.' };
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to send magic link' };
      }
      return {
        success: true,
        message: data.message || 'Magic link sent',
        previewLink: data.previewLink
      };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  const verifyMagicLink = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Invalid or expired magic link' };
      }
      setUser(data.user);
      return { success: true, message: 'Successfully signed in' };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  const loginWithGoogle = async (payload: { email?: string; fullName?: string; googleId?: string; credential?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Google sign-in failed' };
      }
      setUser(data.user);
      closeAuthModal();
      return { success: true, message: 'Signed in with Google' };
    } catch (err: any) {
      return { success: false, message: 'Unable to connect to authentication server. Please check your connection.' };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Failed to request password reset' };
      }
      return { success: true, message: data.message || 'Password reset instructions have been sent.' };
    } catch {
      return { success: false, message: 'Unable to connect to authentication server.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('phantom_user');
      closeProfileModal();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
        updateProfile,
        loginWithCredentials,
        registerWithCredentials,
        requestPasswordChange,
        confirmPasswordChange,
        sendMagicLink,
        verifyMagicLink,
        loginWithGoogle,
        requestPasswordReset,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
