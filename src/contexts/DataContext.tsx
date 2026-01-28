import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Product, Movement, User, normalizeStatus, normalizeMovementType } from '@/types';
import { productService, ApiProduct } from '@/services/productService';
import { movementService, ApiMovement } from '@/services/movementService';
import { userService, ApiUser } from '@/services/userService';
import { reportService, StockReport } from '@/services/reportService';
import { toast } from 'sonner';

interface DataContextType {
  products: Product[];
  movements: Movement[];
  users: User[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  refreshMovements: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  addProduct: (product: { nome: string; descricao: string; estoqueMinimo: number }) => Promise<boolean>;
  updateProduct: (id: string, product: { nome?: string; descricao?: string; estoqueMinimo?: number }) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addMovement: (movement: { productId: string; quantity: number; note: string; type: 'entry' | 'exit' }) => Promise<boolean>;
  addUser: (user: { username: string; password: string; role: string; setor: string }) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getProductMovements: (productId: string) => Movement[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Transform API product to internal format using stock report data
function transformProduct(apiProduct: ApiProduct, stockData?: StockReport): Product {
  const stock = stockData || { currentStock: 0, status: 'NORMAL' };
  return {
    id: apiProduct.id,
    name: apiProduct.nome,
    description: apiProduct.descricao,
    minimumStock: apiProduct.estoqueMinimo,
    currentStock: stock.currentStock,
    status: normalizeStatus(stock.status),
    active: apiProduct.active,
    createdAt: new Date(apiProduct.createdAt),
  };
}

// Transform API movement to internal format
function transformMovement(apiMovement: ApiMovement): Movement {
  return {
    id: apiMovement.id,
    productId: apiMovement.productId,
    productName: apiMovement.nomeProduto,
    type: normalizeMovementType(apiMovement.tipo),
    quantity: apiMovement.quantidade,
    userName: apiMovement.nomeUsuario,
    note: apiMovement.observacao,
    createdAt: new Date(apiMovement.dataHora),
  };
}

// Transform API user to internal format
function transformUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.username,
    role: apiUser.role.toLowerCase() === 'admin' ? 'admin' : 'collaborator',
    setor: apiUser.setor,
    createdAt: new Date(apiUser.createdAt),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      const [apiProducts, stockReport] = await Promise.all([
        productService.getAll(),
        reportService.getStockReport(),
      ]);

      // Create a map of stock data by productId
      const stockMap = new Map(stockReport.map(s => [s.productId, s]));

      const transformed = apiProducts.map(p => transformProduct(p, stockMap.get(p.id)));
      setProducts(transformed);
    } catch (error) {
      console.error('Error refreshing products:', error);
    }
  }, []);

  const refreshMovements = useCallback(async () => {
    try {
      const apiMovements = await movementService.getAll();
      setMovements(apiMovements.map(transformMovement));
    } catch (error) {
      console.error('Error refreshing movements:', error);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const apiUsers = await userService.getAll();
      setUsers(apiUsers.map(transformUser));
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([refreshProducts(), refreshMovements(), refreshUsers()]);
      setIsLoading(false);
    };
    loadData();
  }, [refreshProducts, refreshMovements, refreshUsers]);

  const addProduct = useCallback(async (product: { nome: string; descricao: string; estoqueMinimo: number }) => {
    const result = await productService.create(product);
    if (result) {
      await refreshProducts();
      return true;
    }
    return false;
  }, [refreshProducts]);

  const updateProduct = useCallback(async (id: string, product: { nome?: string; descricao?: string; estoqueMinimo?: number }) => {
    const result = await productService.update(id, product);
    if (result) {
      await refreshProducts();
      return true;
    }
    return false;
  }, [refreshProducts]);

  const deleteProduct = useCallback(async (id: string) => {
    const result = await productService.delete(id);
    if (result) {
      await refreshProducts();
      return true;
    }
    return false;
  }, [refreshProducts]);

  const addMovement = useCallback(async (movement: { productId: string; quantity: number; note: string; type: 'entry' | 'exit' }) => {
    const request = {
      productId: movement.productId,
      quantity: movement.quantity,
      note: movement.note,
    };

    const result = movement.type === 'entry'
      ? await movementService.createEntry(request)
      : await movementService.createExit(request);

    if (result) {
      await Promise.all([refreshMovements(), refreshProducts()]);
      return true;
    }
    return false;
  }, [refreshMovements, refreshProducts]);

  const addUser = useCallback(async (user: { username: string; password: string; role: string; setor: string }) => {
    const result = await userService.create(user);
    if (result) {
      await refreshUsers();
      return true;
    }
    return false;
  }, [refreshUsers]);

  const deleteUser = useCallback(async (id: string) => {
    const result = await userService.delete(id);
    if (result) {
      await refreshUsers();
      return true;
    }
    return false;
  }, [refreshUsers]);

  const getProductMovements = useCallback((productId: string) => {
    return movements
      .filter(m => m.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [movements]);

  return (
    <DataContext.Provider
      value={{
        products,
        movements,
        users,
        isLoading,
        refreshProducts,
        refreshMovements,
        refreshUsers,
        addProduct,
        updateProduct,
        deleteProduct,
        addMovement,
        addUser,
        deleteUser,
        getProductMovements,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
