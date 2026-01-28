import api from '@/lib/api';
import { toast } from 'sonner';

// API response type - exact field names from API
export interface ApiMovement {
  id: string;
  productId: string;
  nomeProduto: string;
  tipo: string; // 'ENTRADA' | 'SAIDA'
  quantidade: number;
  dataHora: string;
  nomeUsuario: string;
  observacao?: string;
}

export interface MovementRequest {
  productId: string;
  quantity: number;
  note: string;
}

export const movementService = {
  async getAll(): Promise<ApiMovement[]> {
    try {
      const response = await api.get<ApiMovement[]>('/api/movimentacoes');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar movimentações';
      toast.error(message);
      return [];
    }
  },

  async createEntry(movement: MovementRequest): Promise<ApiMovement | null> {
    try {
      const response = await api.post<ApiMovement>('/api/movimentacoes/entrada', movement);
      toast.success('Entrada registrada com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar entrada';
      toast.error(message);
      return null;
    }
  },

  async createExit(movement: MovementRequest): Promise<ApiMovement | null> {
    try {
      const response = await api.post<ApiMovement>('/api/movimentacoes/saida', movement);
      toast.success('Saída registrada com sucesso!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar saída';
      toast.error(message);
      return null;
    }
  },
};
