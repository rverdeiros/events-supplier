'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supplierService } from '@/lib/api/supplierService';
import { reviewService } from '@/lib/api/reviewService';
import { contactFormService } from '@/lib/api/contactFormService';
import { useReviewStore } from '@/lib/store/reviewStore';
import { useCategoryStore } from '@/lib/store/categoryStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Supplier, Review, ContactForm } from '@/types';
import { formatDate, getPriceRangeLabel, formatPhone } from '@/lib/utils';
import { MapPin, Phone, Mail, DollarSign, Instagram, MessageCircle, Globe, Star } from 'lucide-react';
import Link from 'next/link';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ContactFormComponent } from '@/components/forms/ContactFormComponent';

export default function SupplierDetailPage() {
  const params = useParams();
  const supplierId = parseInt(params.id as string);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { reviews, setReviews, setLoading: setReviewLoading } = useReviewStore();
  const { categories } = useCategoryStore();
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadSupplier();
    loadReviews();
    loadContactForm();
    loadCategories();
  }, [supplierId]);

  const loadSupplier = async () => {
    try {
      const response = await supplierService.getById(supplierId);
      setSupplier(response.data);
    } catch (error) {
      console.error('Error loading supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewLoading(true);
    try {
      const response = await reviewService.getBySupplier(supplierId);
      setReviews(response.data, response.total);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  const loadContactForm = async () => {
    try {
      const response = await contactFormService.getBySupplier(supplierId);
      setContactForm(response.data);
    } catch (error) {
      // Contact form might not exist, that's ok
    }
  };

  const loadCategories = async () => {
    // Categories should be loaded globally, but if not, load here
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
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
            <p className="text-gray-500 text-lg">Fornecedor não encontrado.</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                Voltar para lista
              </Button>
            </Link>
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
      {/* Supplier Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{supplier.fantasy_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Reviews */}
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
            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancelar' : 'Avaliar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm supplierId={supplierId} onSuccess={() => {
                setShowReviewForm(false);
                loadReviews();
              }} />
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500">Ainda não há avaliações para este fornecedor.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Form */}
      {contactForm && contactForm.active && (
        <Card>
          <CardHeader>
            <CardTitle>Entre em Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactFormComponent formId={contactForm.id} questions={contactForm.questions} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

