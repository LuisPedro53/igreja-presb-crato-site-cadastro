import { supabase } from '../api/supabaseClient';
import type { Usuario } from '../types';

// Buscar todos os usuários
export const getAllUsuarios = async (
  apenasAtivos = false
): Promise<Usuario[]> => {
  try {
    let query = supabase
      .from('usuario')
      .select('cdusuario, nmlogin, cdpessoa, ativo, ultimo_acesso')
      .order('nmlogin', { ascending: true });

    if (apenasAtivos) query = query.eq('ativo', true);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((u: any) => ({
      cdUsuario: u.cdusuario,
      nmLogin: u.nmlogin,
      senha: '',
      cdpessoa: u.cdpessoa,
      ativo: u.ativo,
      ultimo_acesso: u.ultimo_acesso,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar usuários');
  }
};

// Buscar usuário por id
export const getUsuarioById = async (id: number): Promise<Usuario | null> => {
  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('cdusuario, nmlogin, cdpessoa, ativo, ultimo_acesso')
      .eq('cdusuario', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      cdUsuario: data.cdusuario,
      nmLogin: data.nmlogin,
      senha: '',
      cdpessoa: data.cdpessoa,
      ativo: data.ativo,
      ultimo_acesso: data.ultimo_acesso,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar usuário');
  }
};

// Criar usuário (usa authService.createUser para hash e validação)
export const createUsuario = async (payload: {
  nmLogin: string;
  senha: string;
  cdpessoa?: number | null;
  ativo?: boolean;
}) => {
  try {
    const resp = await fetch('/api/usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nmlogin: payload.nmLogin,
        senha: payload.senha,
        cdpessoa: payload.cdpessoa || null,
        ativo: payload.ativo,
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

// Atualizar usuário (exceto senha)
export const updateUsuario = async (
  id: number,
  data: Partial<{
    nmLogin: string;
    cdpessoa?: number | null;
    ativo?: boolean;
    senha?: string;
  }>
) => {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.nmLogin !== undefined) updateData.nmlogin = data.nmLogin;
    if (data.cdpessoa !== undefined) updateData.cdpessoa = data.cdpessoa;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // If senha provided, send raw senha and let server hash (server expects senha if present)
    if (data.senha) {
      updateData.senha = data.senha;
    }

    const resp = await fetch(`/api/usuario/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar usuário');
  }
};

// Desativar usuário (soft delete)
export const deleteUsuario = async (id: number) => {
  try {
    const resp = await fetch(`/api/usuario/${id}/deactivate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao desativar usuário');
  }
};
