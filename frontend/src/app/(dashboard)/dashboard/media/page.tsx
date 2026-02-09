'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { supplierService } from '@/lib/api/supplierService';
import { useUIStore } from '@/lib/store/uiStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Media, MediaType, Supplier } from '@/types';
import { Trash2, Plus, Image as ImageIcon, Video, File } from 'lucide-react';

export default function MediaManagementPage() {
  useRequireAuth('supplier');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<MediaType>('image');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadSupplier();
  }, []);

  useEffect(() => {
    if (supplier) {
      loadMedia();
    }
  }, [supplier]);

  const loadSupplier = async () => {
    setIsLoading(true);
    try {
      const response = await supplierService.getMySupplier();
      setSupplier(response.data.supplier);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Supplier not found
        setSupplier(null);
      } else {
        setError(error.message || 'Erro ao carregar dados do fornecedor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedia = async () => {
    if (!supplier) return;
    try {
      const response = await supplierService.getMedia(supplier.id);
      setMedia(response.data);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleAddMedia = async () => {
    if (!supplier) return;

    setIsUploading(true);
    try {
      if (uploadMethod === 'file') {
        if (!selectedFile) {
          setError('Selecione um arquivo');
          setIsUploading(false);
          return;
        }
        await supplierService.uploadMedia(supplier.id, selectedFile, newMediaType);
        setSuccess('Mídia enviada com sucesso!');
        setSelectedFile(null);
      } else {
        if (!newMediaUrl) {
          setError('URL é obrigatória');
          setIsUploading(false);
          return;
        }
        await supplierService.addMedia({
          supplier_id: supplier.id,
          type: newMediaType,
          url: newMediaUrl,
        });
        setSuccess('Mídia adicionada com sucesso!');
        setNewMediaUrl('');
      }
      setShowAddModal(false);
      loadMedia();
    } catch (error: any) {
      setError(error.message || 'Erro ao adicionar mídia');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Auto-detect media type based on file extension
      const ext = file.name.toLowerCase().split('.').pop();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
        setNewMediaType('image');
      } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
        setNewMediaType('video');
      } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
        setNewMediaType('document');
      }
      setSelectedFile(file);
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return;
    try {
      await supplierService.deleteMedia(id);
      setSuccess('Mídia excluída com sucesso!');
      loadMedia();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir mídia');
    }
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'document':
        return <File className="w-6 h-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse">Carregando...</div>
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
            <p className="text-gray-500 mb-4">Você precisa criar um perfil de fornecedor primeiro.</p>
            <Button onClick={() => window.location.href = '/dashboard/supplier/create'}>
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
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Mídia</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Mídia
        </Button>
      </div>

      {media.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Nenhuma mídia adicionada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => {
            const mediaUrl = item.url.startsWith('http') 
              ? item.url 
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${item.url}`;
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {item.type === 'image' && (
                    <div className="w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={mediaUrl}
                        alt={`Mídia ${item.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getMediaIcon(item.type)}
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteMedia(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 break-all block truncate"
                      title={item.url}
                    >
                      {item.url}
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewMediaUrl('');
          setSelectedFile(null);
          setUploadMethod('file');
        }}
        title="Adicionar Mídia"
      >
        <div className="space-y-4">
          <Select
            label="Método de Adição"
            options={[
              { value: 'file', label: 'Upload de Arquivo' },
              { value: 'url', label: 'URL Externa' },
            ]}
            value={uploadMethod}
            onChange={(e) => {
              setUploadMethod(e.target.value as 'url' | 'file');
              setNewMediaUrl('');
              setSelectedFile(null);
            }}
          />
          
          <Select
            label="Tipo de Mídia"
            options={[
              { value: 'image', label: 'Imagem' },
              { value: 'video', label: 'Vídeo' },
              { value: 'document', label: 'Documento' },
            ]}
            value={newMediaType}
            onChange={(e) => setNewMediaType(e.target.value as MediaType)}
          />

          {uploadMethod === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Arquivo
              </label>
              <input
                type="file"
                accept={
                  newMediaType === 'image' 
                    ? 'image/*' 
                    : newMediaType === 'video' 
                    ? 'video/*' 
                    : '.pdf,.doc,.docx,.txt'
                }
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo selecionado: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ) : (
            <Input
              label="URL da Mídia"
              type="url"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              required
            />
          )}
          
          <Button 
            onClick={handleAddMedia} 
            className="w-full"
            isLoading={isUploading}
            disabled={isUploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !newMediaUrl)}
          >
            {uploadMethod === 'file' ? 'Enviar Arquivo' : 'Adicionar URL'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

