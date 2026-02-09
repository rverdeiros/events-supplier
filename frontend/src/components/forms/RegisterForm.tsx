'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations/authSchemas';
import { authService } from '@/lib/api/authService';
import { useUIStore } from '@/lib/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export const RegisterForm = () => {
  const router = useRouter();
  const { setError, setSuccess } = useUIStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger, // Para forçar validação em tempo real
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // Valida quando sai do campo (mostra erro de obrigatório ou inválido)
    reValidateMode: 'onChange', // Revalida em tempo real após o erro aparecer
    defaultValues: {
      type: 'client', // Sempre cria como cliente
    },
  });

  // Observa mudanças nos valores dos campos tocados e força revalidação
  const nameValue = watch('name');
  const emailValue = watch('email');
  const passwordValue = watch('password');

  useEffect(() => {
    if (touchedFields.name && nameValue !== undefined) {
      trigger('name');
    }
  }, [nameValue, touchedFields.name, trigger]);

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

  // Função helper para mostrar erro
  // Mostra erro se o campo foi tocado (clicou e saiu)
  // O erro desaparece em tempo real quando o campo está sendo editado e fica válido
  const getFieldError = (fieldName: keyof RegisterFormData) => {
    const hasError = errors[fieldName]?.message;
    const isTouched = touchedFields[fieldName];
    
    // Se o campo foi tocado e tem erro, mostra o erro
    // O reValidateMode: 'onChange' garante que o erro desapareça quando corrigido
    return isTouched && hasError ? hasError : undefined;
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Sempre envia como cliente (pessoa física)
      const response = await authService.register({
        ...data,
        type: 'client',
      });
      if (response.success) {
        setSuccess('Cadastro realizado com sucesso! Faça login para continuar.');
        router.push('/login');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome completo"
        {...register('name')}
        error={getFieldError('name')}
        autoComplete="name"
        required
      />

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
          autoComplete="new-password"
          helperText="Mínimo de 8 caracteres, 1 maiúscula e 1 número"
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
      
      {/* Password strength indicator */}
      {watch('password') && (
        <div className="space-y-1">
          <div className="flex gap-2 text-xs">
            {watch('password').length >= 8 ? (
              <span className="text-green-600">✓ 8+ caracteres</span>
            ) : (
              <span className="text-gray-400">8+ caracteres</span>
            )}
            {/[A-Z]/.test(watch('password')) ? (
              <span className="text-green-600">✓ Maiúscula</span>
            ) : (
              <span className="text-gray-400">Maiúscula</span>
            )}
            {/[0-9]/.test(watch('password')) ? (
              <span className="text-green-600">✓ Número</span>
            ) : (
              <span className="text-gray-400">Número</span>
            )}
          </div>
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Cadastrar
      </Button>
    </form>
  );
};

