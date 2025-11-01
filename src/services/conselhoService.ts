import { supabase } from '../api/supabaseClient';
import type { Conselho, ConselhoCompleto } from '../types';

export const getAllConselhos = async (): Promise<ConselhoCompleto[]> => {
  try {
    const { data, error } = await supabase
      .from('conselho')
      .select(
        `
        *,
        pessoa:pessoa!inner(
          cdpessoa,
          nmpessoa,
          fotopessoa,
          telefone,
          email,
          cdtipopessoa,
          tipopessoa:tipopessoa!inner(
            cdtipopessoa,
            nmtipopessoa
          )
        )
      `
      )
      .order('datainicio', { ascending: false });

    if (error) {
      console.error('Erro ao buscar conselhos:', error);
      throw new Error('Erro ao buscar conselhos');
    }

    // Transformar os dados para o formato esperado
    const conselhos: ConselhoCompleto[] = data.map((item: any) => ({
      cdLider: item.cdlider,
      cdpessoa: item.cdpessoa,
      datainicio: item.datainicio,
      datafim: item.datafim,
      observacao: item.observacao,
      ativo: item.ativo,
      nmPessoa: item.pessoa.nmpessoa,
      fotoPessoa: item.pessoa.fotopessoa,
      telefone: item.pessoa.telefone,
      email: item.pessoa.email,
      cargo: item.pessoa.tipopessoa.nmtipopessoa,
      cdTipoPessoa: item.pessoa.tipopessoa.cdtipopessoa,
    }));

    return conselhos;
  } catch (error) {
    console.error('Erro ao buscar conselhos:', error);
    throw error;
  }
};

export const getConselhoById = async (
  id: number
): Promise<ConselhoCompleto | null> => {
  try {
    const { data, error } = await supabase
      .from('conselho')
      .select(
        `
        *,
        pessoa:pessoa!inner(
          cdpessoa,
          nmpessoa,
          fotopessoa,
          telefone,
          email,
          cdtipopessoa,
          tipopessoa:tipopessoa!inner(
            cdtipopessoa,
            nmtipopessoa
          )
        )
      `
      )
      .eq('cdlider', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Conselho não encontrado
      }
      console.error('Erro ao buscar conselho:', error);
      throw new Error('Erro ao buscar conselho');
    }

    // Transformar os dados para o formato esperado
    const conselho: ConselhoCompleto = {
      cdLider: data.cdlider,
      cdpessoa: data.cdpessoa,
      datainicio: data.datainicio,
      datafim: data.datafim,
      observacao: data.observacao,
      ativo: data.ativo,
      nmPessoa: data.pessoa.nmpessoa,
      fotoPessoa: data.pessoa.fotopessoa,
      telefone: data.pessoa.telefone,
      email: data.pessoa.email,
      cargo: data.pessoa.tipopessoa.nmtipopessoa,
      cdTipoPessoa: data.pessoa.tipopessoa.cdtipopessoa,
    };

    return conselho;
  } catch (error) {
    console.error('Erro ao buscar conselho:', error);
    throw error;
  }
};

export const createConselho = async (
  conselho: Omit<Conselho, 'cdLider'>
): Promise<Conselho> => {
  try {
    const resp = await fetch('/api/conselho', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conselho),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    return json?.conselho;
  } catch (error) {
    console.error('Erro ao criar conselho:', error);
    throw error;
  }
};

export const updateConselho = async (
  id: number,
  conselho: Partial<Conselho>
): Promise<Conselho> => {
  try {
    const resp = await fetch(`/api/conselho/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conselho),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    return json?.conselho;
  } catch (error) {
    console.error('Erro ao atualizar conselho:', error);
    throw error;
  }
};

export const deleteConselho = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/conselho/${id}`, {
      method: 'DELETE',
    });

    if (!resp.ok && resp.status !== 204) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error) {
    console.error('Erro ao excluir conselho:', error);
    throw error;
  }
};
