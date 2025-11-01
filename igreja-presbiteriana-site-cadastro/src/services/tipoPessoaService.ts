import { supabase } from '../api/supabaseClient';
import type { TipoPessoa } from '../types';

// ============================================
// SERVIÇO DE TIPOS DE PESSOA
// ============================================

// Buscar todos os tipos
export const getAllTiposPessoa = async (): Promise<TipoPessoa[]> => {
  try {
    const { data, error } = await supabase
      .from('tipopessoa')
      .select('*')
      .order('nmtipopessoa', { ascending: true });

    if (error) throw error;

    return (data || []).map((tp: any) => ({
      cdTipoPessoa: tp.cdtipopessoa,
      nmTipoPessoa: tp.nmtipopessoa,
      created_at: tp.created_at,
      updated_at: tp.updated_at,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar tipos de pessoa');
  }
};

// Criar tipo de pessoa
export const createTipoPessoa = async (
  nmTipoPessoa: string
): Promise<TipoPessoa> => {
  try {
    const resp = await fetch('/api/tipopessoa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmtipopessoa: nmTipoPessoa }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const data = json?.tipopessoa;

    return {
      cdTipoPessoa: data.cdtipopessoa,
      nmTipoPessoa: data.nmtipopessoa,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar tipo de pessoa');
  }
};

// Atualizar tipo de pessoa
export const updateTipoPessoa = async (
  id: number,
  nmTipoPessoa: string
): Promise<void> => {
  try {
    const resp = await fetch(`/api/tipopessoa/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmtipopessoa: nmTipoPessoa }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar tipo de pessoa');
  }
};

// Excluir tipo de pessoa
export const deleteTipoPessoa = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/tipopessoa/${id}`, {
      method: 'DELETE',
    });

    if (!resp.ok && resp.status !== 204) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao excluir tipo de pessoa');
  }
};
