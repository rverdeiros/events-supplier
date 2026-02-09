'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { Toast, ToastType } from './Toast';

export const ToastProvider = () => {
  const { error, success, setError, setSuccess } = useUIStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, setSuccess]);

  return (
    <>
      {error && (
        <Toast
          message={error}
          type="error"
          isVisible={!!error}
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Toast
          message={success}
          type="success"
          isVisible={!!success}
          onClose={() => setSuccess(null)}
        />
      )}
    </>
  );
};

