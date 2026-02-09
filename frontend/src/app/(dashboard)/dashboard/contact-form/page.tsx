'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { supplierService } from '@/lib/api/supplierService';
import { contactFormService } from '@/lib/api/contactFormService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { useUIStore } from '@/lib/store/uiStore';
import { ContactForm, Question } from '@/types';
import { Plus, Trash2, RotateCcw, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';

export default function ContactFormPage() {
  useRequireAuth('supplier');
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [contactForm, setContactForm] = useState<ContactForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'text',
    required: false,
  });
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadData();
  }, []);

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
          // Form doesn't exist yet - user can create one
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

  const handleCreateForm = async () => {
    if (!supplier) return;
    
    try {
      const defaultTemplate = await contactFormService.getDefaultTemplate();
      const response = await contactFormService.create({
        questions: defaultTemplate.data.questions,
        active: true,
      });
      setContactForm(response.data);
      setSuccess('Formulário criado com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar formulário');
    }
  };

  const handleUpdateForm = async () => {
    if (!contactForm) return;
    
    try {
      const response = await contactFormService.update(contactForm.id, {
        questions: contactForm.questions,
        active: contactForm.active,
      });
      setContactForm(response.data);
      setSuccess('Formulário atualizado com sucesso!');
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar formulário');
    }
  };

  const handleResetToDefault = async () => {
    if (!contactForm || !confirm('Tem certeza que deseja resetar para o template padrão? Todas as alterações serão perdidas.')) return;
    
    try {
      const response = await contactFormService.resetToDefault(contactForm.id);
      setContactForm(response.data);
      setSuccess('Formulário resetado para o template padrão!');
    } catch (error: any) {
      setError(error.message || 'Erro ao resetar formulário');
    }
  };

  const handleToggleActive = async () => {
    if (!contactForm) return;
    
    const updatedForm = { ...contactForm, active: !contactForm.active };
    try {
      const response = await contactFormService.update(contactForm.id, updatedForm);
      setContactForm(response.data);
      setSuccess(`Formulário ${response.data.active ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar status do formulário');
    }
  };

  const handleAddQuestion = () => {
    if (!contactForm) return;
    
    if (contactForm.questions.length >= 20) {
      setError('Máximo de 20 questões permitidas');
      return;
    }

    setEditingQuestionIndex(null);
    setNewQuestion({ question: '', type: 'text', required: false });
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (index: number) => {
    if (!contactForm) return;
    
    setEditingQuestionIndex(index);
    setNewQuestion(contactForm.questions[index]);
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = () => {
    if (!contactForm || !newQuestion.question) {
      setError('Preencha a pergunta');
      return;
    }

    const updatedQuestions = [...contactForm.questions];
    
    if (editingQuestionIndex !== null) {
      updatedQuestions[editingQuestionIndex] = newQuestion as Question;
    } else {
      updatedQuestions.push(newQuestion as Question);
    }

    setContactForm({ ...contactForm, questions: updatedQuestions });
    setShowQuestionModal(false);
    setEditingQuestionIndex(null);
    setNewQuestion({ question: '', type: 'text', required: false });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!contactForm || !confirm('Tem certeza que deseja remover esta questão?')) return;
    
    const updatedQuestions = contactForm.questions.filter((_, i) => i !== index);
    setContactForm({ ...contactForm, questions: updatedQuestions });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando formulário..." />
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
            <Button onClick={() => router.push('/dashboard/supplier/create')}>
              Criar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Formulário de Contato</h1>
        <div className="flex gap-2">
          {contactForm && (
            <>
              <Button variant="outline" onClick={handleResetToDefault}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar para Padrão
              </Button>
              <Button
                variant={contactForm.active ? 'outline' : 'primary'}
                onClick={handleToggleActive}
              >
                {contactForm.active ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {!contactForm ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Você ainda não criou um formulário de contato.</p>
            <Button onClick={handleCreateForm}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Formulário (Template Padrão)
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questões do Formulário</CardTitle>
                <Button onClick={handleAddQuestion} disabled={contactForm.questions.length >= 20}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Questão
                </Button>
              </div>
              {contactForm.questions.length >= 20 && (
                <p className="text-sm text-yellow-600 mt-2">
                  Limite de 20 questões atingido
                </p>
              )}
            </CardHeader>
            <CardContent>
              {contactForm.questions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma questão adicionada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {contactForm.questions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{question.question}</span>
                          {question.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Obrigatória</span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                            {question.type}
                          </span>
                        </div>
                        {question.placeholder && (
                          <p className="text-sm text-gray-500">Placeholder: {question.placeholder}</p>
                        )}
                        {question.options && question.options.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Opções: {question.options.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditQuestion(index)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteQuestion(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateForm}>
              Salvar Alterações
            </Button>
          </div>
        </>
      )}

      {/* Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestionIndex(null);
          setNewQuestion({ question: '', type: 'text', required: false });
        }}
        title={editingQuestionIndex !== null ? 'Editar Questão' : 'Adicionar Questão'}
      >
        <div className="space-y-4">
          <Input
            label="Pergunta"
            value={newQuestion.question || ''}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            required
          />

          <Select
            label="Tipo"
            value={newQuestion.type || 'text'}
            onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as Question['type'] })}
            options={[
              { value: 'text', label: 'Texto' },
              { value: 'textarea', label: 'Área de Texto' },
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Telefone' },
              { value: 'number', label: 'Número' },
              { value: 'select', label: 'Seleção Única' },
              { value: 'multiselect', label: 'Seleção Múltipla' },
              { value: 'radio', label: 'Radio' },
              { value: 'checkbox', label: 'Checkbox' },
              { value: 'date', label: 'Data' },
              { value: 'datetime', label: 'Data e Hora' },
            ]}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={newQuestion.required || false}
              onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="required" className="text-sm">Campo obrigatório</label>
          </div>

          <Input
            label="Placeholder (opcional)"
            value={newQuestion.placeholder || ''}
            onChange={(e) => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
          />

          {(newQuestion.type === 'select' || 
            newQuestion.type === 'multiselect' || 
            newQuestion.type === 'radio' || 
            newQuestion.type === 'checkbox') && (
            <Textarea
              label="Opções (uma por linha)"
              value={newQuestion.options?.join('\n') || ''}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter(o => o.trim());
                setNewQuestion({ ...newQuestion, options: options.length > 0 ? options : undefined });
              }}
              rows={4}
              placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowQuestionModal(false);
                setEditingQuestionIndex(null);
                setNewQuestion({ question: '', type: 'text', required: false });
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveQuestion} className="flex-1">
              {editingQuestionIndex !== null ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
