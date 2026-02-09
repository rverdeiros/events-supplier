'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/lib/store/uiStore';
import { User } from '@/types';
import { Trash2, Users, AlertCircle, Mail, User as UserIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  useRequireAuth('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'client' | 'supplier' | 'admin'>('all');
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getUsers();
      setUsers(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.`)) return;
    
    try {
      await authService.deleteUser(id);
      setSuccess('Usuário excluído com sucesso!');
      loadUsers();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir usuário');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'admin':
        return 'Administrador';
      case 'supplier':
        return 'Fornecedor';
      case 'client':
        return 'Cliente';
      default:
        return type;
    }
  };

  const getTypeVariant = (type: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'admin':
        return 'warning';
      case 'supplier':
        return 'success';
      case 'client':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.type === filter);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando usuários..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todos ({users.length})
          </Button>
          <Button
            variant={filter === 'client' ? 'primary' : 'outline'}
            onClick={() => setFilter('client')}
          >
            Clientes ({users.filter(u => u.type === 'client').length})
          </Button>
          <Button
            variant={filter === 'supplier' ? 'primary' : 'outline'}
            onClick={() => setFilter('supplier')}
          >
            Fornecedores ({users.filter(u => u.type === 'supplier').length})
          </Button>
          <Button
            variant={filter === 'admin' ? 'primary' : 'outline'}
            onClick={() => setFilter('admin')}
          >
            Admins ({users.filter(u => u.type === 'admin').length})
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Nenhum usuário encontrado.' 
                : `Nenhum ${getTypeLabel(filter).toLowerCase()} encontrado.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <Badge variant={getTypeVariant(user.type)}>
                          {getTypeLabel(user.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        <span>•</span>
                        <span>Cadastrado em {formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id, user.name)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
