import api from '@/lib/api';
import { toast } from 'sonner';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse | null> {
    try {
      const response = await api.post<LoginResponse>('/autenticacao/login', credentials);


      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', credentials.username);

      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao conectar ao servidor';
      toast.error(message);
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
  },

  getStoredAuth(): { token: string | null; role: string | null; username: string | null } {
    return {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role'),
      username: localStorage.getItem('username'),
    };
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
