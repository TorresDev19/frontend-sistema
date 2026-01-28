import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    // Enquanto carrega, mostra loading
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        );
    }

    // Se não autenticado, vai para login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Se a rota é só para admin e o usuário não é admin
    if (adminOnly && !isAdmin) {
        return <Navigate to="/products" replace />;
    }

    return <>{children}</>;
}
