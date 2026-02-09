import { create } from 'zustand';
import { User } from '@/types';
import { setCookie, deleteCookie, getCookie } from '@/lib/utils/cookies';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initAuth: () => void;
}

// Helper function to initialize auth from storage
const initializeAuthFromStorage = (set: (state: Partial<AuthState>) => void) => {
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('auth_token');
    
    // If no token in localStorage, try to get from cookie
    if (!token) {
      token = getCookie('auth_token');
      if (token) {
        localStorage.setItem('auth_token', token);
      }
    } else {
      // Sync cookie with localStorage
      const cookieToken = getCookie('auth_token');
      if (cookieToken !== token) {
        setCookie('auth_token', token, 7);
      }
    }
    
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        // Invalid data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        deleteCookie('auth_token');
      }
    }
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize auth state from storage when store is created (client-side only)
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    setAuth: (user, token) => {
      set({ user, token, isAuthenticated: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        // Also set cookie for middleware access
        setCookie('auth_token', token, 7);
      }
    },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      deleteCookie('auth_token');
    }
  },
  updateUser: (updatedUser) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    }));
    if (typeof window !== 'undefined' && get().user) {
      localStorage.setItem('user_data', JSON.stringify(get().user));
    }
  },
    initAuth: () => {
      initializeAuthFromStorage(set);
    },
  };

  // Initialize auth state from storage when store is created
  initializeAuthFromStorage(set);

  return initialState;
});

// Helper function to check user role
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'admin';
};

export const useIsSupplier = () => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'supplier';
};

export const useIsClient = () => {
  const user = useAuthStore((state) => state.user);
  return user?.type === 'client';
};

