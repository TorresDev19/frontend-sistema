import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MovementBadge } from '@/components/shared/MovementBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Boxes,
  AlertTriangle,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(175, 80%, 40%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)', 'hsl(142, 71%, 45%)'];

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { products, movements, isLoading } = useData();

  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = movements.filter(
      m => m.createdAt.getMonth() === now.getMonth() && m.createdAt.getFullYear() === now.getFullYear()
    );

    return {
      totalProducts: products.length,
      totalItemsInStock: products.reduce((sum, p) => sum + p.currentStock, 0),
      lowStockProducts: products.filter(p => p.status === 'low').length,
      criticalStockProducts: products.filter(p => p.status === 'critical').length,
      entriesThisMonth: thisMonth.filter(m => m.type === 'entry').length,
      exitsThisMonth: thisMonth.filter(m => m.type === 'exit').length,
    };
  }, [products, movements]);

  const topConsumedProducts = useMemo(() => {
    const consumption: Record<string, { name: string; total: number }> = {};
    movements
      .filter(m => m.type === 'exit')
      .forEach(m => {
        if (!consumption[m.productId]) {
          consumption[m.productId] = { name: m.productName, total: 0 };
        }
        consumption[m.productId].total += m.quantity;
      });
    return Object.values(consumption)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [movements]);

  const movementsByType = useMemo(() => {
    const entries = movements.filter(m => m.type === 'entry').reduce((sum, m) => sum + m.quantity, 0);
    const exits = movements.filter(m => m.type === 'exit').reduce((sum, m) => sum + m.quantity, 0);
    return [
      { name: 'Entradas', value: entries, fill: 'hsl(142, 71%, 45%)' },
      { name: 'Saídas', value: exits, fill: 'hsl(0, 84%, 60%)' },
    ];
  }, [movements]);

  const criticalProducts = products.filter(p => p.status === 'critical' || p.status === 'low');

  const recentMovements = [...movements]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Administrativo"
        description="Visão geral do almoxarifado e métricas de consumo"
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Produtos"
          value={stats.totalProducts}
          icon={<Package className="h-5 w-5" />}
        />
        <StatsCard
          title="Itens em Estoque"
          value={stats.totalItemsInStock.toLocaleString('pt-BR')}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatsCard
          title="Estoque Baixo"
          value={stats.lowStockProducts}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
        />
        <StatsCard
          title="Estoque Crítico"
          value={stats.criticalStockProducts}
          icon={<AlertCircle className="h-5 w-5" />}
          variant="critical"
        />
      </div>

      {/* Monthly Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <StatsCard
          title="Entradas este Mês"
          value={stats.entriesThisMonth}
          icon={<ArrowDownLeft className="h-5 w-5" />}
          variant="success"
        />
        <StatsCard
          title="Saídas este Mês"
          value={stats.exitsThisMonth}
          icon={<ArrowUpRight className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Charts Grid */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Entries vs Exits */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Entradas vs Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={movementsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {movementsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Consumed Products */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-primary" />
              Produtos Mais Consumidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topConsumedProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                  <XAxis type="number" stroke="hsl(215, 20%, 55%)" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(215, 20%, 55%)"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(222, 47%, 8%)',
                      border: '1px solid hsl(222, 30%, 18%)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="total" fill="hsl(175, 80%, 40%)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Replenishment Alerts */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-critical" />
              Alertas de Reposição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalProducts.length > 0 ? (
                criticalProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Estoque: {product.currentStock} / Mínimo: {product.minimumStock}
                      </p>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto precisa de reposição
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.length > 0 ? (
                recentMovements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-4">
                      <MovementBadge type={movement.type} />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {movement.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          por {movement.userName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium text-foreground">
                        {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(movement.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma movimentação registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
