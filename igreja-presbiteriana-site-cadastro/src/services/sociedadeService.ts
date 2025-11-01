import { supabase } from '../api/supabaseClient';
import type { Sociedades } from '../types';

// ============================================
// SERVIÇO DE SOCIEDADES
// ============================================

// Buscar todas as sociedades
export const getAllSociedades = async (
  apenasAtivas = true
): Promise<Sociedades[]> => {
  try {
    let query = supabase
      .from('sociedades')
      .select('*')
      .order('nmsociedade', { ascending: true });

    if (apenasAtivas) {
      query = query.eq('ativo', true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((s: any) => ({
      cdSociedade: s.cdsociedade,
      nmSociedade: s.nmsociedade,
      sigla: s.sigla,
      descricao: s.descricao,
      ativo: s.ativo,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar sociedades');
  }
};

// Buscar sociedade por ID
export const getSociedadeById = async (
  id: number
): Promise<Sociedades | null> => {
  try {
    const { data, error } = await supabase
      .from('sociedades')
      .select('*')
      .eq('cdsociedade', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      cdSociedade: data.cdsociedade,
      nmSociedade: data.nmsociedade,
      sigla: data.sigla,
      descricao: data.descricao,
      ativo: data.ativo,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar sociedade');
  }
};

// Criar sociedade
export const createSociedade = async (data: {
  nmSociedade: string;
  sigla?: string;
  descricao?: string;
  ativo?: boolean;
}): Promise<Sociedades> => {
  try {
    const resp = await fetch('/api/sociedades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nmSociedade: data.nmSociedade,
        sigla: data.sigla || null,
        descricao: data.descricao || null,
        ativo: data.ativo ?? true,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const created = json?.sociedade;

    return {
      cdSociedade: created.cdsociedade,
      nmSociedade: created.nmsociedade,
      sigla: created.sigla,
      descricao: created.descricao,
      ativo: created.ativo,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar sociedade');
  }
};

// Atualizar sociedade
export const updateSociedade = async (
  id: number,
  data: Partial<{
    nmSociedade: string;
    sigla?: string;
    descricao?: string;
    ativo?: boolean;
  }>
): Promise<void> => {
  try {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.nmSociedade !== undefined)
      updateData.nmSociedade = data.nmSociedade;
    if (data.sigla !== undefined) updateData.sigla = data.sigla;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const resp = await fetch(`/api/sociedades/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar sociedade');
  }
};

// Excluir sociedade (desativar)
export const deleteSociedade = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/sociedades/${id}/deactivate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao excluir sociedade');
  }
};

// Buscar membros de uma sociedade
export const getMembrosBySociedade = async (
  cdsociedade: number
): Promise<any[]> => {
  try {
    // Incluir o FK cdpessoatiposociedade e o join com a tabela de tipos para obter o rótulo
    const { data, error } = await supabase
      .from('pessoassociedade')
      .select(
        `
        *,
        pessoa:cdpessoa (
          cdpessoa,
          nmpessoa,
          fotopessoa,
          telefone,
          email
        ),
        pessoatiposociedade:cdpessoatiposociedade (
          cdpessoatiposociedade,
          nmcargo
        )
      `
      )
      .eq('cdsociedade', cdsociedade)
      .eq('ativo', true)
      .order('dataentrada', { ascending: false });

    if (error) throw error;

    return (data || []).map((ps: any) => ({
      cdpessoaSociedade: ps.cdpessoasociedade,
      cdpessoa: ps.cdpessoa,
      cdSociedade: ps.cdsociedade,
      dataEntrada: ps.dataentrada,
      // FK e label do cargo
      cdpessoatiposociedade: ps.cdpessoatiposociedade ?? null,
      cargo: ps.cargo ?? null,
      cargoLabel: ps.pessoatiposociedade?.nmcargo ?? ps.cargo ?? null,
      ativo: ps.ativo,
      pessoa: ps.pessoa,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar membros da sociedade');
  }
};
