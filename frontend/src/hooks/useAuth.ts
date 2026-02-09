'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { authService } from '@/lib/api/authService';
import { User } from '@/types';
import { isTokenExpired } from '@/lib/utils/jwt';
import { deleteCookie } from '@/lib/utils/cookies';

export const useRequireAuth = (requiredRole?: 'admin' | 'supplier' | 'client') => {
  const router = useRouter();
  const { user, isAuthenticated, initAuth, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        router.push('/login');
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        deleteCookie('auth_token');
        router.push('/login?expired=true');
        setIsLoading(false);
        return;
      }

      // If not authenticated but have token, try to get user data
      if (!isAuthenticated && token) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setAuth(userData, token);
          }
        } catch (error) {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          deleteCookie('auth_token');
          router.push('/login');
        }
      }

      // Check role requirement - only redirect if we have user data and role doesn't match
      if (requiredRole && user && user.type !== requiredRole) {
        router.push('/');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, requiredRole, router, setAuth]);

  return { user, isAuthenticated, isLoading };
};

/**
 * Hook to get current authenticated user
 * Fetches user data if not already in store
 */
export const useAuth = () => {
  const { user, isAuthenticated, initAuth, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!isAuthenticated);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setIsLoading(false);
        return;
      }

      // If authenticated but no user data, fetch it
      if (isAuthenticated && !user) {
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            setAuth(userData, token);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }

      setIsLoading(false);
    };

    if (!user && isAuthenticated) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, setAuth]);

  return { user, isAuthenticated, isLoading };
};

