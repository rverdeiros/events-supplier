'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { categoryService } from '@/lib/api/categoryService';
import { supplierService } from '@/lib/api/supplierService';
import { Category, Supplier } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import Link from 'next/link';
import { MapPin, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function CategorySuppliersPage() {
  const params = useParams();
  const categoryIdParam = params.id as string;
  const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : null;
  const [category, setCategory] = useState<Category | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  useEffect(() => {
    if (categoryId && !isNaN(categoryId)) {
      loadCategory();
      loadSuppliers();
    } else {
      setLoading(false);
      setLoadingSuppliers(false);
    }
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const response = await categoryService.list(true);
      const foundCategory = response.data.find((cat) => cat.id === categoryId);
      setCategory(foundCategory || null);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    if (!categoryId || isNaN(categoryId)) {
      setSuppliers([]);
      setLoadingSuppliers(false);
      return;
    }
    
    try {
      setLoadingSuppliers(true);
      const allSuppliers: Supplier[] = [];
      let page = 1;
      const pageSize = 50; // Maximum allowed by backend
      let hasMore = true;

      // Load all pages of suppliers
      while (hasMore) {
        const response = await supplierService.list({
          category_id: categoryId,
          page_size: pageSize,
          page: page,
        });
        
        if (response && response.data && Array.isArray(response.data)) {
          allSuppliers.push(...response.data);
          
          // Check if there are more pages
          const totalPages = response.total_pages || 0;
          hasMore = page < totalPages;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setSuppliers(allSuppliers);
    } catch (error: any) {
      console.error('Error loading suppliers:', error);
      console.error('Error details:', error.response?.data || error.message);
      setSuppliers([]);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading variant="full-screen" text="Carregando categoria..." />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Categoria não encontrada.</p>
            <Link href="/categorias">
              <Button variant="primary">Voltar para Categorias</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/categorias">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600 mt-1">
              {suppliers.length} fornecedor{suppliers.length !== 1 ? 'es' : ''} cadastrado{suppliers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Suppliers Grid */}
        {loadingSuppliers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Nenhum fornecedor encontrado nesta categoria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <Link key={supplier.id} href={`/fornecedores/${supplier.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                  {/* Supplier Image Placeholder */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
                      {supplier.fantasy_name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="line-clamp-1">{supplier.fantasy_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    {supplier.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {supplier.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm flex-grow">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{supplier.city}, {supplier.state}</span>
                      </div>
                      {supplier.price_range && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Tag className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {supplier.price_range === 'low' ? 'Econômico' : 
                             supplier.price_range === 'medium' ? 'Médio' : 
                             supplier.price_range === 'high' ? 'Alto' : supplier.price_range}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
