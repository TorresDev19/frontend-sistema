import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MovementBadge } from '@/components/shared/MovementBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownLeft, ArrowUpRight, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Movements() {
  const { isAdmin } = useAuth();
  const { products, movements, addMovement, isLoading } = useData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entry' | 'exit'>('entry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    note: '',
  });

  const handleSubmit = async () => {
    if (!formData.productId) {
      return;
    }
    if (formData.quantity <= 0) {
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (movementType === 'exit' && product && formData.quantity > product.currentStock) {
      return;
    }

    setIsSubmitting(true);
    const success = await addMovement({
      productId: formData.productId,
      quantity: formData.quantity,
      note: formData.note || 'Movimentação registrada',
      type: movementType,
    });
    setIsSubmitting(false);

    if (success) {
      setFormData({ productId: '', quantity: 1, note: '' });
      setIsDialogOpen(false);
    }
  };

  const recentMovements = [...movements]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20);

  const selectedProduct = products.find(p => p.id === formData.productId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando movimentações...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Movimentações"
        description="Registre entradas e saídas de produtos"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="glow">
              <ArrowLeftRight className="h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>

            <Tabs
              defaultValue="entry"
              onValueChange={(v) => setMovementType(v as 'entry' | 'exit')}
              className="pt-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entry" className="gap-2">
                  <ArrowDownLeft className="h-4 w-4" />
                  Entrada
                </TabsTrigger>
                <TabsTrigger value="exit" className="gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Saída
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(v) => setFormData({ ...formData, productId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {product.name}
                            <span className="text-xs text-muted-foreground">
                              (Estoque: {product.currentStock})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="rounded-lg bg-muted/30 p-3">
                    <p className="text-sm text-muted-foreground">
                      Estoque disponível:{' '}
                      <span className="font-mono font-medium text-foreground">
                        {selectedProduct.currentStock}
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    max={movementType === 'exit' ? selectedProduct?.currentStock : undefined}
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observação</Label>
                  <Textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Observação sobre a movimentação (opcional)"
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full" variant="glow" disabled={isSubmitting}>
                  {isSubmitting ? 'Registrando...' : movementType === 'entry' ? 'Registrar Entrada' : 'Registrar Saída'}
                </Button>
              </div>
            </Tabs>
          </DialogContent>
        </Dialog>
      </PageHeader>

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
                  className="flex items-center justify-between rounded-lg bg-muted/30 p-4 transition-all hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <MovementBadge type={movement.type} />
                    <div>
                      <p className="font-medium text-foreground">{movement.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {movement.note || 'Sem observação'}
                        {isAdmin && ` • por ${movement.userName}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-semibold text-foreground">
                      {movement.type === 'entry' ? '+' : '-'}
                      {movement.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(movement.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma movimentação registrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}

function ArrowLeftRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 3 4 7l4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </svg>
  );
}
