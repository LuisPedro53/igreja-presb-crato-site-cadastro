import { supabase } from '../api/supabaseClient';
import type { TipoEvento } from '../types';

// ============================================
// SERVIÇO DE TIPOS DE EVENTO
// ============================================

// Buscar todos os tipos
export const getAllTiposEvento = async (): Promise<TipoEvento[]> => {
  try {
    const { data, error } = await supabase
      .from('tipoevento')
      .select('*')
      .order('nmtipoevento', { ascending: true });

    if (error) throw error;

    return (data || []).map((te: any) => ({
      cdTipoEvento: te.cdtipoevento,
      nmTipoEvento: te.nmtipoevento,
      created_at: te.created_at,
      updated_at: te.updated_at,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar tipos de evento');
  }
};

// Criar tipo de evento
export const createTipoEvento = async (
  nmTipoEvento: string
): Promise<TipoEvento> => {
  try {
    const resp = await fetch('/api/tipoevento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmtipoevento: nmTipoEvento }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const data = json?.tipoevento;

    return {
      cdTipoEvento: data.cdtipoevento,
      nmTipoEvento: data.nmtipoevento,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar tipo de evento');
  }
};

// Atualizar tipo de evento
export const updateTipoEvento = async (
  id: number,
  nmTipoEvento: string
): Promise<void> => {
  try {
    const resp = await fetch(`/api/tipoevento/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmtipoevento: nmTipoEvento }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar tipo de evento');
  }
};

// Excluir tipo de evento
export const deleteTipoEvento = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/tipoevento/${id}`, {
      method: 'DELETE',
    });

    if (!resp.ok && resp.status !== 204) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao excluir tipo de evento');
  }
};
