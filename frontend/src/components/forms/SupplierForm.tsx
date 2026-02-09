'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, SupplierFormData } from '@/lib/validations/supplierSchemas';
import { supplierService } from '@/lib/api/supplierService';
import { categoryService } from '@/lib/api/categoryService';
import { useUIStore } from '@/lib/store/uiStore';
import { useCategoryStore } from '@/lib/store/categoryStore';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Supplier } from '@/types';
import { formatCNPJ, formatCEP, formatPhone } from '@/lib/utils/formatters';

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSuccess }) => {
  const { setError, setSuccess } = useUIStore();
  const { categories, setCategories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompanyState, setIsCompanyState] = useState(false);

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
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    mode: 'onChange',
    defaultValues: supplier
      ? {
          supplier_type: supplier.supplier_type || 'individual',
          fantasy_name: supplier.fantasy_name || '',
          legal_name: supplier.legal_name || '',
          cnpj: supplier.cnpj || '',
          description: supplier.description || '',
          category_id: supplier.category_id,
          address: supplier.address || '',
          zip_code: supplier.zip_code || '',
          city: supplier.city || '',
          state: supplier.state || '',
          price_range: supplier.price_range,
          phone: supplier.phone || '',
          email: supplier.email || '',
          instagram_url: supplier.instagram_url || '',
          whatsapp_url: supplier.whatsapp_url || '',
          site_url: supplier.site_url || '',
        }
      : {
          supplier_type: 'individual',
          fantasy_name: '',
          legal_name: '',
          cnpj: '',
          description: '',
          address: '',
          zip_code: '',
          city: '',
          state: '',
          phone: '',
          email: '',
          instagram_url: '',
          whatsapp_url: '',
          site_url: '',
        },
  });

  // Initialize isCompanyState from supplier if available
  useEffect(() => {
    if (supplier) {
      setIsCompanyState(supplier.supplier_type === 'company');
    }
  }, [supplier]);

  // Update form values when supplier changes
  useEffect(() => {
    if (supplier) {
      const supplierType = supplier.supplier_type || 'individual';
      const isCompany = supplierType === 'company';
      setIsCompanyState(isCompany);
      
      reset({
        supplier_type: supplierType,
        fantasy_name: supplier.fantasy_name || '',
        legal_name: supplier.legal_name || '',
        cnpj: supplier.cnpj || '',
        description: supplier.description || '',
        category_id: supplier.category_id,
        address: supplier.address || '',
        zip_code: supplier.zip_code || '',
        city: supplier.city || '',
        state: supplier.state || '',
        price_range: supplier.price_range,
        phone: supplier.phone || '',
        email: supplier.email || '',
        instagram_url: supplier.instagram_url || '',
        whatsapp_url: supplier.whatsapp_url || '',
        site_url: supplier.site_url || '',
      });
      // Force update supplier_type in form state to ensure isCompany is correct
      setValue('supplier_type', supplierType);
    } else {
      setIsCompanyState(false);
    }
  }, [supplier, reset, setValue]);

  const onSubmit = async (data: SupplierFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Remove campos de URL vazios (converte "" para undefined)
      // Também remove campos opcionais vazios para evitar problemas de validação
      const cleanedData: any = {
        fantasy_name: data.fantasy_name?.trim(),
        city: data.city?.trim(),
        state: data.state?.trim(),
        phone: data.phone?.trim(),
        email: data.email?.trim(),
      };
      
      // Campos opcionais - só incluir se não estiverem vazios
      if (data.supplier_type) cleanedData.supplier_type = data.supplier_type;
      if (data.legal_name?.trim()) cleanedData.legal_name = data.legal_name.trim();
      // CNPJ: incluir apenas se fornecido (não vazio) e se for empresa
      if (isCompany && data.cnpj?.trim()) {
        cleanedData.cnpj = data.cnpj.trim();
      } else if (isCompany && !data.cnpj?.trim() && supplier?.supplier_type === 'company') {
        // Se é empresa e não tem CNPJ no formulário, manter o CNPJ existente se houver
        if (supplier.cnpj) {
          cleanedData.cnpj = supplier.cnpj;
        }
      }
      if (data.description?.trim()) cleanedData.description = data.description.trim();
      if (data.category_id) cleanedData.category_id = data.category_id;
      if (data.address?.trim()) cleanedData.address = data.address.trim();
      if (data.zip_code?.trim()) cleanedData.zip_code = data.zip_code.trim();
      if (data.price_range) cleanedData.price_range = data.price_range;
      if (data.instagram_url?.trim()) cleanedData.instagram_url = data.instagram_url.trim();
      if (data.whatsapp_url?.trim()) cleanedData.whatsapp_url = data.whatsapp_url.trim();
      if (data.site_url?.trim()) cleanedData.site_url = data.site_url.trim();
      
      if (supplier?.id) {
        await supplierService.update(supplier.id, cleanedData);
        setSuccess('Fornecedor atualizado com sucesso!');
      } else {
        await supplierService.create(cleanedData);
        setSuccess('Fornecedor criado com sucesso!');
      }
      
      // Call onSuccess callback if provided (this will handle closing the form and reloading data)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erro ao salvar fornecedor. Tente novamente.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceRangeOptions = [
    { value: '', label: 'Selecione...' },
    { value: 'low', label: 'Econômico' },
    { value: 'medium', label: 'Médio' },
    { value: 'high', label: 'Alto' },
  ];

  const categoryOptions = [
    { value: '', label: 'Selecione...' },
    ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name })),
  ];

  const supplierType = watch('supplier_type');
  // Use state for isCompany to ensure it updates correctly when supplier loads
  const isCompany = supplierType === 'company' || isCompanyState || supplier?.supplier_type === 'company';
  
  // Update isCompanyState when supplierType changes via watch
  useEffect(() => {
    if (supplierType === 'company') {
      setIsCompanyState(true);
    } else if (supplierType === 'individual') {
      setIsCompanyState(false);
    }
  }, [supplierType]);

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

  const handleFormSubmit = handleSubmit(
    onSubmit,
    (errors) => {
      if (Object.keys(errors).length > 0) {
        const errorMessages = Object.entries(errors)
          .map(([field, error]) => `${field}: ${error?.message || 'inválido'}`)
          .join(', ');
        setError(`Erros no formulário: ${errorMessages}`);
      }
    }
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      {isCompany && (
        <>
          <Input
            label="Razão Social"
            {...register('legal_name')}
            error={errors.legal_name?.message}
            required={!supplier}
          />

          <Input
            label="CNPJ"
            {...cnpjRegister}
            onChange={handleCNPJChange}
            error={errors.cnpj?.message}
            placeholder="00.000.000/0000-00"
            maxLength={18}
            required={!supplier}
          />
        </>
      )}

      <Input
        label="Nome Fantasia"
        {...register('fantasy_name')}
        error={errors.fantasy_name?.message}
        required
      />

      <Textarea
        label="Descrição"
        rows={4}
        {...register('description')}
        error={errors.description?.message}
        placeholder="Descreva seus serviços..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          options={categoryOptions}
          value={watch('category_id')?.toString() || ''}
          onChange={(e) => setValue('category_id', e.target.value ? parseInt(e.target.value) : undefined)}
          error={errors.category_id?.message}
        />

        <Select
          label="Faixa de Preço"
          options={priceRangeOptions}
          value={watch('price_range') || ''}
          onChange={(e) => setValue('price_range', e.target.value as 'low' | 'medium' | 'high' | undefined)}
          error={errors.price_range?.message}
        />
      </div>

      <Input
        label="Endereço"
        {...register('address')}
        error={errors.address?.message}
        placeholder="Rua, número, complemento"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="CEP"
          {...zipCodeRegister}
          onChange={handleZipCodeChange}
          error={errors.zip_code?.message}
          placeholder="00000-000"
          maxLength={9}
        />

        <Input
          label="Cidade"
          {...register('city')}
          error={errors.city?.message}
          required
        />

        <Input
          label="Estado (UF)"
          maxLength={2}
          {...register('state')}
          error={errors.state?.message}
          required
          placeholder="SP"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Telefone"
          type="tel"
          {...phoneRegister}
          onChange={handlePhoneChange}
          error={errors.phone?.message}
          required
          placeholder="(11) 99999-9999"
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />
      </div>

      <Input
        label="URL do Instagram"
        type="url"
        {...register('instagram_url')}
        error={errors.instagram_url?.message}
        placeholder="https://instagram.com/seu-perfil"
      />

      <Input
        label="URL do WhatsApp"
        type="url"
        {...register('whatsapp_url')}
        error={errors.whatsapp_url?.message}
        placeholder="https://wa.me/5511999999999"
      />

      <Input
        label="URL do Site"
        type="url"
        {...register('site_url')}
        error={errors.site_url?.message}
        placeholder="https://seusite.com.br"
      />

      <div className="space-y-2">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 font-medium">
              Por favor, corrija os erros acima antes de salvar.
            </p>
          </div>
        )}
        
        <Button 
          type="submit" 
          variant="primary" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : (supplier ? 'Atualizar' : 'Criar') + ' Fornecedor'}
        </Button>
      </div>
    </form>
  );
};

