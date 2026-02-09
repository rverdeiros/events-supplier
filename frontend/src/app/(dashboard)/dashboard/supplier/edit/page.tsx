'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { supplierService } from '@/lib/api/supplierService';
import { reviewService } from '@/lib/api/reviewService';
import { contactFormService } from '@/lib/api/contactFormService';
import { useUIStore } from '@/lib/store/uiStore';
import { useCategoryStore } from '@/lib/store/categoryStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { useRouter } from 'next/navigation';
import { Supplier, Review, ContactForm, Media } from '@/types';
import { AlertCircle, Edit2, MapPin, Phone, Mail, DollarSign, Instagram, MessageCircle, Globe, Star, Image as ImageIcon, FileText, Settings } from 'lucide-react';
import { formatDate, getPriceRangeLabel, formatPhone } from '@/lib/utils';
import { SupplierForm } from '@/components/forms/SupplierForm';
import Link from 'next/link';

export default function EditSupplierPage() {
  useRequireAuth('supplier');
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const { setError, setSuccess } = useUIStore();
  const { categories } = useCategoryStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const supplierResponse = await supplierService.getMySupplier();
      setSupplier(supplierResponse.data.supplier);
      
      // Load reviews
      try {
        const reviewsResponse = await reviewService.getBySupplier(supplierResponse.data.supplier.id);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }

      // Load contact form
      try {
        const formResponse = await contactFormService.getBySupplier(supplierResponse.data.supplier.id);
        setContactForm(formResponse.data);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading contact form:', error);
        }
      }

      // Load media
      try {
        const mediaResponse = await supplierService.getMedia(supplierResponse.data.supplier.id);
        setMedia(mediaResponse.data);
      } catch (error) {
        console.error('Error loading media:', error);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setError('Perfil de fornecedor não encontrado. Crie um perfil primeiro.');
        router.push('/dashboard/supplier/create');
      } else {
        setError(error.message || 'Erro ao carregar dados do fornecedor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    setEditingSection(null);
    loadData();
    setSuccess('Dados atualizados com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando dados do fornecedor..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Perfil de fornecedor não encontrado.</p>
            <button
              onClick={() => router.push('/dashboard/supplier/create')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Criar perfil agora
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const category = categories.find((cat) => cat.id === supplier.category_id);
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Supplier Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl">{supplier.fantasy_name}</CardTitle>
            <button
              onClick={() => setEditingSection(editingSection === 'basic' ? null : 'basic')}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Editar informações básicas"
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'basic' ? (
            <SupplierForm
              supplier={supplier}
              onSuccess={handleUpdateSuccess}
            />
          ) : (
            <>
              {supplier.description && (
                <p className="text-gray-700">{supplier.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>{supplier.city}, {supplier.state}</span>
                </div>
                {supplier.price_range && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-5 h-5" />
                    <span>{getPriceRangeLabel(supplier.price_range)}</span>
                  </div>
                )}
                {category && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      {category.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5" />
                  <a href={`tel:${supplier.phone}`} className="hover:text-blue-600">
                    {formatPhone(supplier.phone)}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5" />
                  <a href={`mailto:${supplier.email}`} className="hover:text-blue-600">
                    {supplier.email}
                  </a>
                </div>
                {supplier.whatsapp_url && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <a
                      href={supplier.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
                {supplier.instagram_url && (
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-pink-600" />
                    <a
                      href={supplier.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      Instagram
                    </a>
                  </div>
                )}
                {supplier.site_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <a
                      href={supplier.site_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Site
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Media Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mídias</CardTitle>
            <Link href="/dashboard/media">
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Gerenciar mídias"
              >
                <ImageIcon className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">Nenhuma mídia adicionada ainda.</p>
              <Link href="/dashboard/media">
                <button className="text-blue-600 hover:text-blue-700 underline">
                  Adicionar mídias
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.slice(0, 8).map((item) => {
                const mediaUrl = item.url.startsWith('http') 
                  ? item.url 
                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${item.url}`;
                
                return (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {item.type === 'image' ? (
                      <img
                        src={mediaUrl}
                        alt={`Mídia ${item.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
              {media.length > 8 && (
                <Link href="/dashboard/media">
                  <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <span className="text-gray-600 text-sm">+{media.length - 8} mais</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Avaliações</CardTitle>
              {averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">({reviews.length} avaliações)</span>
                </div>
              )}
            </div>
            <Link href={`/fornecedores/${supplier.id}`}>
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Ver página pública"
              >
                <Star className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-gray-500">Ainda não há avaliações para este fornecedor.</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{review.user_name || 'Anônimo'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
              {reviews.length > 3 && (
                <Link href={`/fornecedores/${supplier.id}`}>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    Ver todas as {reviews.length} avaliações
                  </button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Formulário de Contato</CardTitle>
            <Link href="/dashboard/contact-form">
              <button
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                title="Editar formulário de contato"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {contactForm ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {contactForm.active ? 'Ativo' : 'Inativo'}
                </span>
                <span className="text-sm text-gray-500">
                  {contactForm.questions.length} perguntas
                </span>
              </div>
              <Link href="/dashboard/contact-form">
                <button className="text-blue-600 hover:text-blue-700 text-sm underline">
                  Gerenciar formulário
                </button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">Formulário de contato não configurado.</p>
              <Link href="/dashboard/contact-form">
                <button className="text-blue-600 hover:text-blue-700 underline text-sm">
                  Criar formulário
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
