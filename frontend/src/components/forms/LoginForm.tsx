'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchemas';
import { authService } from '@/lib/api/authService';
import { useAuthStore } from '@/lib/store/authStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const { setError, setSuccess } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Valida quando sai do campo (mostra erro de obrigatório ou inválido)
    reValidateMode: 'onChange', // Revalida em tempo real após o erro aparecer
  });

  // Função helper para mostrar erro
  // Mostra erro se o campo foi tocado (clicou e saiu)
  // O erro desaparece em tempo real quando o campo está sendo editado e fica válido
  const getFieldError = (fieldName: keyof LoginFormData) => {
    const hasError = errors[fieldName]?.message;
    const isTouched = touchedFields[fieldName];
    
    // Se o campo foi tocado e tem erro, mostra o erro
    // O reValidateMode: 'onChange' garante que o erro desapareça quando corrigido
    return isTouched && hasError ? hasError : undefined;
  };

  // Observa mudanças nos valores dos campos tocados e força revalidação
  const emailValue = watch('email');
  const passwordValue = watch('password');

  useEffect(() => {
    if (touchedFields.email && emailValue !== undefined) {
      trigger('email');
    }
  }, [emailValue, touchedFields.email, trigger]);

  useEffect(() => {
    if (touchedFields.password && passwordValue !== undefined) {
      trigger('password');
    }
  }, [passwordValue, touchedFields.password, trigger]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.access_token) {
        // Try to get user data
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            setAuth(user, response.access_token);
          } else {
            // Fallback: decode token for basic info
            const { decodeJWT } = await import('@/lib/utils/jwt');
            const payload = decodeJWT(response.access_token);
            if (payload) {
              setAuth(
                {
                  id: parseInt(payload.sub, 10),
                  name: '',
                  email: data.email,
                  type: (payload.type as 'client' | 'supplier' | 'admin') || 'client',
                  created_at: '',
                },
                response.access_token
              );
            }
          }
        } catch (userError) {
          // If getCurrentUser fails, still proceed with login
          console.warn('Could not fetch user data:', userError);
        }
        
        setSuccess('Login realizado com sucesso!');
        const redirect = searchParams.get('redirect') || '/';
        // Small delay to ensure state is persisted before redirect
        // This ensures the auth state is saved to localStorage before page reload
        setTimeout(() => {
          window.location.href = redirect;
        }, 100);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={getFieldError('email')}
        autoComplete="email"
        required
      />

      <div className="relative">
        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          {...register('password')}
          error={getFieldError('password')}
          autoComplete="current-password"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Entrar
      </Button>
    </form>
  );
};

