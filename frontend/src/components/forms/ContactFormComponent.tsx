'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSubmissionSchema, ContactFormSubmissionFormData } from '@/lib/validations/contactFormSchemas';
import { contactFormService } from '@/lib/api/contactFormService';
import { useUIStore } from '@/lib/store/uiStore';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Question } from '@/types';
import { formatPhone } from '@/lib/utils/formatters';

interface ContactFormComponentProps {
  formId: number;
  questions: Question[];
}

export const ContactFormComponent: React.FC<ContactFormComponentProps> = ({ formId, questions }) => {
  const { setError, setSuccess } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormSubmissionFormData>({
    resolver: zodResolver(contactFormSubmissionSchema),
  });

  // Handler para formatar telefone enquanto o usuário digita
  const phoneRegister = register('submitter_phone');
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    e.target.value = formatted;
    phoneRegister.onChange(e);
  };

  const onSubmit = async (data: ContactFormSubmissionFormData) => {
    setIsLoading(true);
    try {
      // Build answers object from form data
      const answers: Record<string, string> = {};
      questions.forEach((question, index) => {
        const value = (data as any)[`answer_${index}`];
        if (value !== undefined) {
          answers[index.toString()] = String(value);
        }
      });

      await contactFormService.submit(formId, {
        answers,
        submitter_name: data.submitter_name,
        submitter_email: data.submitter_email,
        submitter_phone: data.submitter_phone,
      });

      setSuccess('Formulário enviado com sucesso!');
      reset();
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const fieldName = `answer_${index}` as keyof ContactFormSubmissionFormData;

    switch (question.type) {
      case 'textarea':
        return (
          <Textarea
            key={index}
            label={question.question}
            {...register(fieldName as any, { required: question.required })}
            placeholder={question.placeholder}
            maxLength={question.max_length}
            required={question.required}
          />
        );

      case 'select':
      case 'multiselect':
        return (
          <Select
            key={index}
            label={question.question}
            options={[
              { value: '', label: question.placeholder || 'Selecione...' },
              ...(question.options || []).map((opt) => ({ value: opt, label: opt })),
            ]}
            {...register(fieldName as any, { required: question.required })}
            required={question.required}
          />
        );

      case 'email':
        return (
          <Input
            key={index}
            label={question.question}
            type="email"
            {...register(fieldName as any, { required: question.required })}
            placeholder={question.placeholder}
            required={question.required}
          />
        );

      case 'number':
        return (
          <Input
            key={index}
            label={question.question}
            type="number"
            {...register(fieldName as any, {
              required: question.required,
              min: question.min_value,
              max: question.max_value,
            })}
            placeholder={question.placeholder}
            required={question.required}
          />
        );

      case 'date':
      case 'datetime':
        return (
          <Input
            key={index}
            label={question.question}
            type={question.type === 'datetime' ? 'datetime-local' : 'date'}
            {...register(fieldName as any, { required: question.required })}
            required={question.required}
          />
        );

      default:
        return (
          <Input
            key={index}
            label={question.question}
            type="text"
            {...register(fieldName as any, {
              required: question.required,
              minLength: question.min_length,
              maxLength: question.max_length,
            })}
            placeholder={question.placeholder}
            required={question.required}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {questions.map((question, index) => renderQuestion(question, index))}

      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Seus Dados</h3>
        <div className="space-y-4">
          <Input
            label="Nome"
            {...register('submitter_name')}
            error={errors.submitter_name?.message}
            required
          />
          <Input
            label="Email"
            type="email"
            {...register('submitter_email')}
            error={errors.submitter_email?.message}
            required
          />
          <Input
            label="Telefone"
            type="tel"
            {...phoneRegister}
            onChange={handlePhoneChange}
            error={errors.submitter_phone?.message}
            required
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
        Enviar Formulário
      </Button>
    </form>
  );
};

