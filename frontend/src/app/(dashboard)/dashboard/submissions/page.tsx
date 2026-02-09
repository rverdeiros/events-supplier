'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { supplierService } from '@/lib/api/supplierService';
import { contactFormService } from '@/lib/api/contactFormService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/lib/store/uiStore';
import { ContactFormSubmission, ContactForm, Question } from '@/types';
import { Eye, EyeOff, AlertCircle, Mail, Phone, User } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function SubmissionsPage() {
  useRequireAuth('supplier');
  const [supplier, setSupplier] = useState<any>(null);
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [submissions, setSubmissions] = useState<ContactFormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactFormSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRead, setFilterRead] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (contactForm) {
      loadSubmissions();
    }
  }, [contactForm, page, filterRead]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const supplierResponse = await supplierService.getMySupplier();
      setSupplier(supplierResponse.data.supplier);
      
      try {
        const formResponse = await contactFormService.getBySupplier(supplierResponse.data.supplier.id);
        setContactForm(formResponse.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setContactForm(null);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!contactForm) return;
    
    try {
      const response = await contactFormService.getSubmissions(
        contactForm.id,
        page,
        10,
        filterRead ?? undefined
      );
      setSubmissions(response.data);
      setTotal(response.total);
      setUnreadCount(response.unread_count || 0);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar submissões');
    }
  };

  const handleMarkAsRead = async (submission: ContactFormSubmission) => {
    if (!contactForm) return;
    
    try {
      await contactFormService.markAsRead(contactForm.id, submission.id);
      setSuccess('Submissão marcada como lida');
      loadSubmissions();
      if (selectedSubmission?.id === submission.id) {
        setSelectedSubmission({ ...submission, read: true });
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao marcar como lida');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuestionText = (index: number): string => {
    if (!contactForm || !contactForm.questions[index]) {
      return `Questão ${index + 1}`;
    }
    return contactForm.questions[index].question;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando submissões..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Você precisa criar um perfil de fornecedor primeiro.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contactForm) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Você precisa criar um formulário de contato primeiro.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submissões Recebidas</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} {unreadCount === 1 ? 'submissão não lida' : 'submissões não lidas'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterRead === null ? 'primary' : 'outline'}
            onClick={() => setFilterRead(null)}
          >
            Todas
          </Button>
          <Button
            variant={filterRead === false ? 'primary' : 'outline'}
            onClick={() => setFilterRead(false)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Não Lidas ({unreadCount})
          </Button>
          <Button
            variant={filterRead === true ? 'primary' : 'outline'}
            onClick={() => setFilterRead(true)}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Lidas
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {filterRead === false 
                ? 'Nenhuma submissão não lida' 
                : filterRead === true
                ? 'Nenhuma submissão lida'
                : 'Nenhuma submissão recebida ainda'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card
                key={submission.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  !submission.read ? 'border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => setSelectedSubmission(submission)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!submission.read && (
                          <Badge variant="info">Nova</Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(submission.created_at)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {submission.submitter_name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{submission.submitter_name}</span>
                          </div>
                        )}
                        {submission.submitter_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{submission.submitter_email}</span>
                          </div>
                        )}
                        {submission.submitter_phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{submission.submitter_phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!submission.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(submission);
                        }}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {page} de {Math.ceil(total / 10)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 10)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* Submission Detail Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Detalhes da Submissão"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{formatDate(selectedSubmission.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={selectedSubmission.read ? 'default' : 'info'}>
                  {selectedSubmission.read ? 'Lida' : 'Não lida'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Informações do Contato</h3>
              {selectedSubmission.submitter_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{selectedSubmission.submitter_name}</span>
                </div>
              )}
              {selectedSubmission.submitter_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selectedSubmission.submitter_email}`} className="text-blue-600 hover:underline">
                    {selectedSubmission.submitter_email}
                  </a>
                </div>
              )}
              {selectedSubmission.submitter_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${selectedSubmission.submitter_phone}`} className="text-blue-600 hover:underline">
                    {selectedSubmission.submitter_phone}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold">Respostas</h3>
              {Object.entries(selectedSubmission.answers).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    {getQuestionText(parseInt(key))}
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {value || <span className="text-gray-400">Não informado</span>}
                  </p>
                </div>
              ))}
            </div>

            {!selectedSubmission.read && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    handleMarkAsRead(selectedSubmission);
                    setSelectedSubmission(null);
                  }}
                  className="w-full"
                >
                  Marcar como lida
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
