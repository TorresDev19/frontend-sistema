import api from '@/lib/api';
import { toast } from 'sonner';

// API response type - exact field names from API (English for reports)
export interface StockReport {
  productId: string;
  name: string;
  minimumStock: number;
  currentStock: number;
  status: string; // 'NORMAL' | 'LOW' | 'CRITICAL'
}

export const reportService = {
  async getStockReport(): Promise<StockReport[]> {
    try {
      const response = await api.get<StockReport[]>('/api/reports/stock');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar relatório de estoque';
      toast.error(message);
      return [];
    }
  },
};
