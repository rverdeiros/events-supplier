'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '@/lib/validations/categorySchemas';
import { categoryService } from '@/lib/api/categoryService';
import { useUIStore } from '@/lib/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Category } from '@/types';

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess }) => {
  const { setError, setSuccess } = useUIStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          origin: category.origin,
          active: category.active,
        }
      : {
          active: true,
          origin: 'manual',
        },
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await categoryService.update(category.id, data);
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await categoryService.create(data);
        setSuccess('Categoria criada com sucesso!');
      }
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar categoria. Tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome da Categoria"
        {...register('name')}
        error={errors.name?.message}
        required
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          {...register('active')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Categoria ativa
        </label>
      </div>

      <Button type="submit" variant="primary" className="w-full">
        {category ? 'Atualizar' : 'Criar'} Categoria
      </Button>
    </form>
  );
};

