import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import type { AuthUser, LoginCredentials, AuthContextType } from '../types';
import toast from 'react-hot-toast';

// ============================================
// CONTEXT DE AUTENTICAÇÃO
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = authService.getCurrentUser();

        if (currentUser) {
          // Validar se a sessão ainda é válida
          const isValid = await authService.validateSession();

          if (isValid) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Fazer login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const authUser = await authService.login(credentials);
      setUser(authUser);
      toast.success(`Bem-vindo, ${authUser.nomePessoa || authUser.nmLogin}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  // Fazer logout
  const logout = (): void => {
    authService.logout();
    setUser(null);
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};
