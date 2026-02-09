'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { categoryService } from '@/lib/api/categoryService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/lib/store/uiStore';
import { Category } from '@/types';
import { Plus, Trash2, Edit, AlertCircle, FolderOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';

export default function AdminCategoriesPage() {
  useRequireAuth('admin');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoryService.list();
      setCategories(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) return;
    
    try {
      await categoryService.delete(id);
      setSuccess('Categoria excluída com sucesso!');
      loadCategories();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir categoria');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.update(category.id, { active: !category.active });
      setSuccess(`Categoria ${!category.active ? 'ativada' : 'desativada'} com sucesso!`);
      loadCategories();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar categoria');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando categorias..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Categorias</h1>
        <Button onClick={() => {
          setEditingCategory(null);
          setShowCategoryModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada.</p>
            <Button onClick={() => {
              setEditingCategory(null);
              setShowCategoryModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-gray-400" />
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={category.active ? 'success' : 'default'}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Origem:</span>
                    <span className="text-sm font-medium">
                      {category.origin === 'fixed' ? 'Sistema' : 'Manual'}
                    </span>
                  </div>
                  {category.supplier_count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fornecedores:</span>
                      <span className="text-sm font-medium">{category.supplier_count}</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleToggleActive(category)}
                  >
                    {category.active ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSuccess={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
            loadCategories();
          }}
        />
      </Modal>
    </div>
  );
}
