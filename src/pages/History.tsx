import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MovementBadge } from '@/components/shared/MovementBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function History() {
  const { isAdmin } = useAuth();
  const { movements, products, isLoading } = useData();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    productId: searchParams.get('product') || 'all',
    type: 'all' as 'entry' | 'exit' | 'all',
    dateFrom: '',
    dateTo: '',
  });

  const filteredMovements = useMemo(() => {
    return movements
      .filter((m) => {
        if (filters.productId !== 'all' && m.productId !== filters.productId) return false;
        if (filters.type !== 'all' && m.type !== filters.type) return false;
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (m.createdAt < fromDate) return false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59);
          if (m.createdAt > toDate) return false;
        }
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [movements, filters]);

  const summary = useMemo(() => {
    const entries = filteredMovements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0);
    const exits = filteredMovements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    return { entries, exits, total: filteredMovements.length };
  }, [filteredMovements]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando histórico...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Histórico de Movimentações"
        description="Consulte o histórico completo de entradas e saídas"
      />

      {/* Filters */}
      <Card className="glass-card border-border/50 mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select
                value={filters.productId}
                onValueChange={(v) => setFilters({ ...filters, productId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(v) => setFilters({ ...filters, type: v as 'entry' | 'exit' | 'all' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="entry">Entrada</SelectItem>
                  <SelectItem value="exit">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="mt-1 text-2xl font-bold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-success/30 bg-success/5">
          <CardContent className="pt-6">
            <p className="text-sm text-success">Total de Entradas</p>
            <p className="mt-1 text-2xl font-bold text-success">+{summary.entries}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-critical/30 bg-critical/5">
          <CardContent className="pt-6">
            <p className="text-sm text-critical">Total de Saídas</p>
            <p className="mt-1 text-2xl font-bold text-critical">-{summary.exits}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead>Tipo</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Observação</TableHead>
              {isAdmin && <TableHead>Usuário</TableHead>}
              <TableHead>Data/Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length > 0 ? (
              filteredMovements.map((movement) => (
                <TableRow key={movement.id} className="border-border/30 hover:bg-muted/20">
                  <TableCell>
                    <MovementBadge type={movement.type} />
                  </TableCell>
                  <TableCell className="font-medium">{movement.productName}</TableCell>
                  <TableCell>
                    <span className={`font-mono font-semibold ${
                      movement.type === 'entry' ? 'text-success' : 'text-critical'
                    }`}>
                      {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{movement.note || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-muted-foreground">{movement.userName}</TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {format(movement.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  Nenhuma movimentação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AppLayout>
  );
}
