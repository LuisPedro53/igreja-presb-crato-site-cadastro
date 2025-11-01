import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type ReactNode } from 'react';

// ============================================
// COMPONENTE PARA PROTEGER ROTAS
// ============================================

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '1.2rem',
          color: '#6b7280',
        }}
      >
        Carregando...
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  // Se estiver autenticado, renderizar o componente filho
  return <>{children}</>;
};
