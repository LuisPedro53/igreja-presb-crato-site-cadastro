import { supabase } from '../api/supabaseClient';
import type { Pessoa, PessoaCompleta, PessoaInput } from '../types';

// ============================================
// SERVIÇO DE PESSOAS
// ============================================

// Buscar todas as pessoas
export const getAllPessoas = async (filters?: {
  tipoPessoa?: number;
  sociedade?: number;
  busca?: string;
  ativo?: boolean;
}): Promise<PessoaCompleta[]> => {
  try {
    // Se houver filtro por sociedade, buscar a partir da tabela de associação
    if (filters?.sociedade) {
      const { data, error } = await supabase
        .from('pessoassociedade')
        .select(
          `
        *,
        pessoa:cdpessoa (
          cdpessoa,
          nmpessoa,
          cdtipopessoa,
          fotopessoa,
          dtnascimento,
          telefone,
          email,
          endereco,
          ativo,
          created_at,
          updated_at,
          tipopessoa:cdtipopessoa (cdtipopessoa, nmtipopessoa)
        )
      `
        )
        .eq('cdsociedade', filters.sociedade)
        .eq('ativo', true)
        .order('dataentrada', { ascending: false });

      if (error) throw error;

      // mapear para lista de pessoas únicas
      const pessoasMap: Record<number, any> = {};
      (data || []).forEach((ps: any) => {
        const p = ps.pessoa;
        if (p && !pessoasMap[p.cdpessoa]) {
          pessoasMap[p.cdpessoa] = p;
        }
      });

      const arr = Object.values(pessoasMap);

      return (arr || []).map((p: any) => ({
        cdpessoa: p.cdpessoa,
        nmPessoa: p.nmpessoa,
        cdTipoPessoa: p.cdtipopessoa,
        fotoPessoa: p.fotopessoa,
        dtNascimento: p.dtnascimento,
        telefone: p.telefone,
        email: p.email,
        endereco: p.endereco,
        ativo: p.ativo,
        created_at: p.created_at,
        updated_at: p.updated_at,
        nmTipoPessoa: p.tipopessoa?.nmtipopessoa,
        idade: p.dtnascimento
          ? new Date().getFullYear() - new Date(p.dtnascimento).getFullYear()
          : undefined,
      }));
    }

    // Buscar pessoas incluindo vínculos (pessoassociedade) e tipos de cargo
    let query = supabase
      .from('pessoa')
      .select(
        `
        *,
        tipopessoa:cdtipopessoa (
          cdtipopessoa,
          nmtipopessoa
        ),
        pessoassociedade (
          cdpessoasociedade,
          cdpessoa,
          cdsociedade,
          dataentrada,
          cargo,
          cdpessoatiposociedade,
          ativo,
          sociedade:cdsociedade (cdsociedade, nmsociedade, sigla),
          pessoatiposociedade:cdpessoatiposociedade (cdpessoatiposociedade, nmcargo)
        )
      `
      )
      .order('nmpessoa', { ascending: true });

    // Aplicar filtros
    if (filters?.tipoPessoa) {
      query = query.eq('cdtipopessoa', filters.tipoPessoa);
    }

    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    if (filters?.busca) {
      query = query.ilike('nmpessoa', `%${filters.busca}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transformar para o formato esperado e extrair cargos (labels)
    return (data || []).map((p: any) => {
      // selecionar vínculos ativos
      const vinculos = (p.pessoassociedade || []).filter(
        (v: any) => v?.ativo !== false
      );

      // labels de cargo (preferir nmcargo da tabela de tipos, fallback para cargo texto)
      const cargoLabels = vinculos
        .map((v: any) => v?.pessoatiposociedade?.nmcargo || v?.cargo)
        .filter(Boolean);

      // cargoLabel principal (primeiro vínculo ativo)
      const cargoLabel = cargoLabels.length > 0 ? cargoLabels[0] : null;

      return {
        cdpessoa: p.cdpessoa,
        nmPessoa: p.nmpessoa,
        cdTipoPessoa: p.cdtipopessoa,
        fotoPessoa: p.fotopessoa,
        dtNascimento: p.dtnascimento,
        telefone: p.telefone,
        email: p.email,
        endereco: p.endereco,
        ativo: p.ativo,
        created_at: p.created_at,
        updated_at: p.updated_at,
        nmTipoPessoa: p.tipopessoa?.nmtipopessoa,
        idade: p.dtnascimento
          ? new Date().getFullYear() - new Date(p.dtnascimento).getFullYear()
          : undefined,
        // anexar campos auxiliares para frontend
        cargoLabel,
        cargoLabels,
        pessoassociedade: vinculos,
      };
    });
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar pessoas');
  }
};

// Buscar pessoa por ID
export const getPessoaById = async (
  id: number
): Promise<PessoaCompleta | null> => {
  try {
    const { data, error } = await supabase
      .from('pessoa')
      .select(
        `
        *,
        tipopessoa:cdtipopessoa (
          cdtipopessoa,
          nmtipopessoa
        )
      `
      )
      .eq('cdpessoa', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      cdpessoa: data.cdpessoa,
      nmPessoa: data.nmpessoa,
      cdTipoPessoa: data.cdtipopessoa,
      fotoPessoa: data.fotopessoa,
      dtNascimento: data.dtnascimento,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      ativo: data.ativo,
      created_at: data.created_at,
      updated_at: data.updated_at,
      nmTipoPessoa: data.tipopessoa?.nmtipopessoa,
      idade: data.dtnascimento
        ? new Date().getFullYear() - new Date(data.dtnascimento).getFullYear()
        : undefined,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar pessoa');
  }
};

// Criar nova pessoa (via endpoint server-side que usa service_role key)
export const createPessoa = async (data: PessoaInput): Promise<Pessoa> => {
  try {
    const resp = await fetch('/api/pessoa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nmpessoa: data.nmPessoa,
        cdtipopessoa: data.cdTipoPessoa,
        fotopessoa: data.fotoPessoa || null,
        dtnascimento: data.dtNascimento || null,
        telefone: data.telefone || null,
        email: data.email || null,
        endereco: data.endereco || null,
        ativo: data.ativo ?? true,
      }),
    });

    // Ler corpo de forma robusta: pode ser vazio (404) ou JSON
    const text = await resp.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = null;
    }

    if (!resp.ok) {
      const errMsg = json?.error || text || `HTTP ${resp.status}`;
      throw new Error(errMsg);
    }

    const pessoa = json?.pessoa;
    if (!pessoa) {
      throw new Error('Resposta inválida do servidor ao criar pessoa');
    }

    return {
      cdpessoa: pessoa.cdpessoa,
      nmPessoa: pessoa.nmpessoa,
      cdTipoPessoa: pessoa.cdtipopessoa,
      fotoPessoa: pessoa.fotopessoa,
      dtNascimento: pessoa.dtnascimento,
      telefone: pessoa.telefone,
      email: pessoa.email,
      endereco: pessoa.endereco,
      ativo: pessoa.ativo,
      created_at: pessoa.created_at,
      updated_at: pessoa.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar pessoa');
  }
};

// Atualizar pessoa
export const updatePessoa = async (
  id: number,
  data: Partial<PessoaInput>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.nmPessoa !== undefined) updateData.nmpessoa = data.nmPessoa;
    if (data.cdTipoPessoa !== undefined)
      updateData.cdtipopessoa = data.cdTipoPessoa;
    if (data.fotoPessoa !== undefined) updateData.fotopessoa = data.fotoPessoa;
    if (data.dtNascimento !== undefined)
      updateData.dtnascimento = data.dtNascimento;
    if (data.telefone !== undefined) updateData.telefone = data.telefone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.endereco !== undefined) updateData.endereco = data.endereco;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const resp = await fetch(`/api/pessoa/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar pessoa');
  }
};

// Excluir pessoa (desativar)
export const deletePessoa = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/pessoa/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: false }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao excluir pessoa');
  }
};

// Upload de foto
export const uploadFotoPessoa = async (
  file: File,
  pessoaId: number
): Promise<string> => {
  try {
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await fetch(`/api/upload/pessoa/${pessoaId}`, {
      method: 'POST',
      body: form,
    });

    const text = await resp.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (e) {
      json = null;
    }

    if (!resp.ok) {
      const errMsg = json?.error || text || `HTTP ${resp.status}`;
      throw new Error(errMsg);
    }

    return json.url;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer upload da foto');
  }
};

// Buscar sociedades de uma pessoa
export const getPessoaSociedades = async (pessoaId: number) => {
  try {
    // Incluir join com tipos de cargo para expor nmcargo (cargoLabel)
    const { data, error } = await supabase
      .from('pessoassociedade')
      .select(
        `
        *,
        sociedade:cdsociedade (
          cdsociedade,
          nmsociedade,
          sigla
        ),
        pessoatiposociedade:cdpessoatiposociedade (
          cdpessoatiposociedade,
          nmcargo
        )
      `
      )
      .eq('cdpessoa', pessoaId)
      .eq('ativo', true)
      .order('dataentrada', { ascending: false });

    if (error) throw error;

    return (data || []).map((ps: any) => ({
      cdpessoaSociedade: ps.cdpessoasociedade,
      cdpessoa: ps.cdpessoa,
      cdSociedade: ps.cdsociedade,
      dataEntrada: ps.dataentrada,
      // Texto legado
      cargo: ps.cargo,
      // FK e label do cargo (quando disponível)
      cdpessoatiposociedade: ps.cdpessoatiposociedade ?? null,
      cargoLabel: ps.pessoatiposociedade?.nmcargo ?? ps.cargo ?? null,
      ativo: ps.ativo,
      nmSociedade: ps.sociedade?.nmsociedade,
      sigla: ps.sociedade?.sigla,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar sociedades da pessoa');
  }
};

// Adicionar pessoa a uma sociedade
export const addPessoaToSociedade = async (data: {
  cdpessoa: number;
  cdSociedade: number;
  cargo?: string;
  cdpessoatiposociedade?: number | null;
  dataEntrada?: string;
}): Promise<void> => {
  try {
    const resp = await fetch('/api/pessoassociedade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cdpessoa: data.cdpessoa,
        cdsociedade: data.cdSociedade,
        // enviar preferencialmente o FK do tipo de cargo
        cargo: data.cargo || null,
        cdpessoatiposociedade: data.cdpessoatiposociedade ?? null,
        dataentrada: data.dataEntrada || new Date().toISOString().split('T')[0],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao adicionar pessoa à sociedade');
  }
};

// Remover pessoa de uma sociedade
export const removePessoaFromSociedade = async (
  cdpessoaSociedade: number
): Promise<void> => {
  try {
    const resp = await fetch(`/api/pessoassociedade/${cdpessoaSociedade}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao remover pessoa da sociedade');
  }
};
