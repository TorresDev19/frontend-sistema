import api from '@/lib/api';
import { toast } from 'sonner';

// API response type - exact field names from API (Portuguese)
export interface ApiProduct {
  id: string;
  nome: string;
  descricao: string;
  estoqueMinimo: number;
  active: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  nome: string;
  descricao: string;
  estoqueMinimo: number;
}

export interface UpdateProductRequest {
  nome?: string;
  descricao?: string;
  estoqueMinimo?: number;
}

export const productService = {
  async getAll(): Promise<ApiProduct[]> {
    try {
      const response = await api.get<ApiProduct[]>('/api/produtos');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar produtos';
      toast.error(message);
      return [];
    }
  },

  async create(product: CreateProductRequest): Promise<ApiProduct | null> {
    try {
      const response = await api.post<ApiProduct>('/api/produtos', product);
      toast.success('Produto criado com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar produto';
      toast.error(message);
      return null;
    }
  },

  async update(id: string, product: UpdateProductRequest): Promise<ApiProduct | null> {
    try {
      const response = await api.put<ApiProduct>(`/api/produtos/${id}`, product);
      toast.success('Produto atualizado com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar produto';
      toast.error(message);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/produtos/${id}`);
      toast.success('Produto desativado com sucesso!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao desativar produto';
      toast.error(message);
      return false;
    }
  },

  async getLowStock(): Promise<ApiProduct[]> {
    try {
      const response = await api.get<ApiProduct[]>('/api/produtos/estoque-baixo');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar produtos com estoque baixo';
      toast.error(message);
      return [];
    }
  },
};
