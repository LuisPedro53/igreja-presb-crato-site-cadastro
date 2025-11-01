import { supabase } from '../api/supabaseClient';
import bcrypt from 'bcryptjs';
import type { LoginCredentials, AuthUser } from '../types';

// ============================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================

const STORAGE_KEY = 'auth_user';

// Função para fazer hash da senha
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Função para verificar senha
export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Fazer login
export const login = async (
  credentials: LoginCredentials
): Promise<AuthUser> => {
  try {
    console.log('🔍 Tentando fazer login com:', credentials.nmLogin);

    // Buscar usuário pelo login - TODAS as colunas em MINÚSCULAS!
    const { data: usuario, error } = await supabase
      .from('usuario')
      .select('cdusuario, nmlogin, senha, cdpessoa, ativo')
      .eq('nmlogin', credentials.nmLogin)
      .single();

    console.log('📊 Resposta do Supabase:', { usuario, error });

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }

    // Verificar senha
    const senhaValida = await verifyPassword(credentials.senha, usuario.senha);

    if (!senhaValida) {
      throw new Error('Senha incorreta');
    }

    // Atualizar último acesso
    await supabase
      .from('usuario')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('cdusuario', usuario.cdusuario);

    // Buscar nome da pessoa se tiver cdpessoa
    let nomePessoa: string | undefined = undefined;
    if (usuario.cdpessoa) {
      const { data: pessoa } = await supabase
        .from('pessoa')
        .select('nmpessoa')
        .eq('cdpessoa', usuario.cdpessoa)
        .single();

      nomePessoa = pessoa?.nmpessoa;
    }

    const authUser: AuthUser = {
      cdUsuario: usuario.cdusuario,
      nmLogin: usuario.nmlogin,
      cdpessoa: usuario.cdpessoa,
      ativo: usuario.ativo,
      nomePessoa,
    };

    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));

    return authUser;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer login');
  }
};

// Fazer logout
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Obter usuário atual do localStorage
export const getCurrentUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const user = JSON.parse(stored) as AuthUser;

    // Validar se o objeto tem as propriedades necessárias
    if (!user.cdUsuario || !user.nmLogin) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
};

// Verificar se está autenticado
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Criar usuário (apenas para admin)
export const createUser = async (data: {
  nmLogin: string;
  senha: string;
  cdpessoa?: number | null;
  ativo?: boolean;
}): Promise<void> => {
  try {
    // Delegate user creation to server-side endpoint which uses service_role key
    const resp = await fetch('/api/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nmlogin: data.nmLogin,
        senha: data.senha,
        cdpessoa: data.cdpessoa || null,
        ativo: data.ativo ?? true,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar usuário');
  }
};

// Atualizar senha do usuário
export const updatePassword = async (
  cdUsuario: number,
  novaSenha: string
): Promise<void> => {
  try {
    const resp = await fetch(`/api/usuario/${cdUsuario}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: novaSenha }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar senha');
  }
};

// Validar token/sessão (pode ser expandido no futuro)
export const validateSession = async (): Promise<boolean> => {
  const user = getCurrentUser();

  if (!user) {
    return false;
  }

  try {
    // Verificar se o usuário ainda existe e está ativo
    const { data, error } = await supabase
      .from('usuario')
      .select('ativo')
      .eq('cdusuario', user.cdUsuario)
      .single();

    if (error || !data || !data.ativo) {
      logout();
      return false;
    }

    return true;
  } catch {
    logout();
    return false;
  }
};
