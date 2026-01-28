export type UserRole = 'admin' | 'collaborator' | 'ADMIN' | 'COLLABORATOR';

export type StockStatus = 'normal' | 'low' | 'critical' | 'NORMAL' | 'LOW' | 'CRITICAL';

export type MovementType = 'entry' | 'exit' | 'ENTRADA' | 'SAIDA';

export type UnitOfMeasure = 'unidade' | 'litro' | 'mililitro';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  setor?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  minimumStock: number;
  currentStock: number;
  status: StockStatus;
  active: boolean;
  createdAt: Date;
  lastMovement?: Date;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  note?: string;
  userId?: string;
  userName: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalItemsInStock: number;
  lowStockProducts: number;
  criticalStockProducts: number;
  entriesThisMonth: number;
  exitsThisMonth: number;
}

export interface SectorConsumption {
  sector: string;
  total: number;
}

export interface ProductConsumption {
  productId: string;
  productName: string;
  totalConsumed: number;
  averageMonthly: number;
}

// Helper functions to normalize API values
export function normalizeRole(role: string): 'admin' | 'collaborator' {
  const normalized = role.toLowerCase();
  return normalized === 'admin' ? 'admin' : 'collaborator';
}

export function normalizeStatus(status: string): 'normal' | 'low' | 'critical' {
  const normalized = status.toLowerCase();
  if (normalized === 'critical' || normalized === 'critico') return 'critical';
  if (normalized === 'low' || normalized === 'baixo') return 'low';
  return 'normal';
}

export function normalizeMovementType(type: string): 'entry' | 'exit' {
  const normalized = type.toLowerCase();
  return normalized === 'entrada' || normalized === 'entry' ? 'entry' : 'exit';
}
