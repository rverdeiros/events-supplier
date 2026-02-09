'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companySupplierSchema, CompanySupplierFormData } from '@/lib/validations/supplierSchemas';
import { supplierService } from '@/lib/api/supplierService';
import { categoryService } from '@/lib/api/categoryService';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useCategoryStore } from '@/lib/store/categoryStore';
import { authService } from '@/lib/api/authService';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatCNPJ, formatCEP, formatPhone } from '@/lib/utils/formatters';

interface CompanySupplierFormProps {
  onSuccess?: () => void;
}

export const CompanySupplierForm: React.FC<CompanySupplierFormProps> = ({ onSuccess }) => {
  const { setError, setSuccess } = useUIStore();
  const { user, setAuth, token } = useAuthStore();
  const { categories, setCategories } = useCategoryStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryService.list(true);
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    if (categories.length === 0) {
      loadCategories();
    }
  }, [categories.length, setCategories]);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    trigger,
    setValue,
  } = useForm<CompanySupplierFormData>({
    resolver: zodResolver(companySupplierSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      supplier_type: 'company',
    },
  });

  // Handlers para formatar campos enquanto o usuário digita
  const cnpjRegister = register('cnpj');
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    e.target.value = formatted;
    cnpjRegister.onChange(e);
  };

  const zipCodeRegister = register('zip_code');
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    e.target.value = formatted;
    zipCodeRegister.onChange(e);
  };

  const phoneRegister = register('phone');
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
    phoneRegister.onChange(e);
  };

  // Não precisamos do useEffect - react-hook-form já valida em tempo real com reValidateMode: 'onChange'

  const getFieldError = (fieldName: keyof CompanySupplierFormData) => {
    const hasError = errors[fieldName]?.message;
    const isTouched = touchedFields[fieldName];
    return isTouched && hasError ? hasError : undefined;
  };

  const onSubmit = async (data: SupplierFormData) => {
    setIsLoading(true);
    try {
      // Remove campos de URL vazios (converte "" para undefined)
      const cleanedData = {
        ...data,
        supplier_type: 'company' as const,
        instagram_url: data.instagram_url?.trim() || undefined,
        whatsapp_url: data.whatsapp_url?.trim() || undefined,
        site_url: data.site_url?.trim() || undefined,
      };
      
      await supplierService.create(cleanedData);
      
      // Update user type to 'supplier' after creating supplier
      // Reload user data to get updated type from backend
      if (token) {
        try {
          const updatedUser = await authService.getCurrentUser();
          if (updatedUser) {
            setAuth(updatedUser, token);
          } else if (user) {
            // Fallback: update user type locally
            setAuth({ ...user, type: 'supplier' }, token);
          }
        } catch (error) {
          // If getCurrentUser fails, update locally
          if (user) {
            setAuth({ ...user, type: 'supplier' }, token);
          }
        }
      }
      
      setSuccess('Fornecedor cadastrado com sucesso!');
      
      // Call onSuccess callback (which will redirect with window.location.href)
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao cadastrar fornecedor. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const response = await categoryService.create({
        name: newCategoryName.trim(),
        origin: 'manual',
        active: true,
      });
      setCategories([...categories, response.data]);
      setValue('category_id', response.data.id);
      setNewCategoryName('');
      setShowNewCategory(false);
      setSuccess('Categoria criada com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar categoria.');
    }
  };

  const categoryOptions = [
    { value: '', label: 'Selecione...' },
    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
    { value: 'new', label: '+ Adicionar nova categoria' },
  ];

  // Estados brasileiros
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">Dados da Empresa</h3>

        <Input
          label="Razão Social"
          {...register('legal_name')}
          error={getFieldError('legal_name')}
          required
        />

        <Input
          label="Nome Fantasia"
          {...register('fantasy_name')}
          error={getFieldError('fantasy_name')}
          required
        />

        <Input
          label="CNPJ"
          {...cnpjRegister}
          onChange={handleCNPJChange}
          error={getFieldError('cnpj')}
          required
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />

        <Textarea
          label="Descrição"
          rows={4}
          {...register('description')}
          error={getFieldError('description')}
          placeholder="Descreva os serviços oferecidos pela empresa..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              label="Categoria"
              options={categoryOptions}
              value={watch('category_id')?.toString() || ''}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setShowNewCategory(true);
                  setValue('category_id', undefined);
                } else {
                  setValue('category_id', e.target.value ? parseInt(e.target.value) : undefined);
                }
              }}
              error={getFieldError('category_id')}
            />
            {showNewCategory && (
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Nome da nova categoria"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Criar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>

          <Select
            label="Faixa de Preço"
            options={[
              { value: '', label: 'Selecione...' },
              { value: 'low', label: 'Econômico' },
              { value: 'medium', label: 'Médio' },
              { value: 'high', label: 'Alto' },
            ]}
            value={watch('price_range') || ''}
            onChange={(e) => setValue('price_range', e.target.value as 'low' | 'medium' | 'high' | undefined)}
            error={getFieldError('price_range')}
          />
        </div>

        <h3 className="font-semibold text-gray-700 mt-6">Endereço Comercial</h3>

        <Input
          label="Endereço Comercial"
          {...register('address')}
          error={getFieldError('address')}
          required
          placeholder="Rua, número, complemento"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="CEP"
            {...zipCodeRegister}
            onChange={handleZipCodeChange}
            error={getFieldError('zip_code')}
            required
            placeholder="00000-000"
            maxLength={9}
          />

          <Input
            label="Cidade"
            {...register('city')}
            error={getFieldError('city')}
            required
          />

          <Select
            label="Estado"
            options={[
              { value: '', label: 'Selecione...' },
              ...states.map((state) => ({ value: state, label: state })),
            ]}
            value={watch('state') || ''}
            onChange={(e) => setValue('state', e.target.value)}
            error={getFieldError('state')}
            required
          />
        </div>

        <h3 className="font-semibold text-gray-700 mt-6">Contato</h3>

        <Input
          label="Telefone de Contato"
          type="tel"
          {...phoneRegister}
          onChange={handlePhoneChange}
          error={getFieldError('phone')}
          required
          placeholder="(11) 99999-9999"
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={getFieldError('email')}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Instagram"
            type="url"
            {...register('instagram_url')}
            error={getFieldError('instagram_url')}
            placeholder="https://instagram.com/sua-empresa"
          />

          <Input
            label="WhatsApp"
            type="url"
            {...register('whatsapp_url')}
            error={getFieldError('whatsapp_url')}
            placeholder="https://wa.me/5511999999999"
          />
        </div>

        <Input
          label="Site"
          type="url"
          {...register('site_url')}
          error={getFieldError('site_url')}
          placeholder="https://suaempresa.com.br"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Cadastrar Fornecedor
      </Button>
    </form>
  );
};
