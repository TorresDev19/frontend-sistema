import api from '@/lib/api';
import { toast } from 'sonner';

// API response type - exact field names from API
export interface ApiUser {
  id: string;
  username: string;
  role: string;
  setor: string;
  createdAt: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
  setor: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  role?: string;
  setor?: string;
}

export const userService = {
  async getAll(): Promise<ApiUser[]> {
    try {
      const response = await api.get<ApiUser[]>('/api/users');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar usuários';
      toast.error(message);
      return [];
    }
  },

  async create(user: CreateUserRequest): Promise<ApiUser | null> {
    try {
      const response = await api.post<ApiUser>('/api/users', user);
      toast.success('Usuário criado com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar usuário';
      toast.error(message);
      return null;
    }
  },

  async update(id: string, user: UpdateUserRequest): Promise<ApiUser | null> {
    try {
      const response = await api.put<ApiUser>(`/api/users/${id}`, user);
      toast.success('Usuário atualizado com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('Usuário removido com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover usuário';
      toast.error(message);
      return false;
    }
  },
};
