import { supabase } from '../api/supabaseClient';
import type { Eventos, EventoCompleto, EventoInput } from '../types';

// ============================================
// SERVIÇO DE EVENTOS
// ============================================

// Buscar todos os eventos
export const getAllEventos = async (filters?: {
  tipoEvento?: number;
  sociedade?: number;
  datainicio?: string;
  datafim?: string;
  ativo?: boolean;
}): Promise<EventoCompleto[]> => {
  try {
    let query = supabase
      .from('eventos')
      .select(
        `
        *,
        tipoevento:cdtipoevento (
          cdtipoevento,
          nmtipoevento
        ),
        sociedade:cdsociedade (
          cdsociedade,
          nmsociedade,
          sigla
        )
      `
      )
      .order('dtevento', { ascending: false });

    // Aplicar filtros
    if (filters?.tipoEvento) {
      query = query.eq('cdtipoevento', filters.tipoEvento);
    }

    if (filters?.sociedade) {
      query = query.eq('cdsociedade', filters.sociedade);
    }

    if (filters?.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    if (filters?.datainicio) {
      query = query.gte('dtevento', filters.datainicio);
    }

    if (filters?.datafim) {
      query = query.lte('dtevento', filters.datafim);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transformar para o formato esperado
    return (data || []).map((e: any) => ({
      cdEvento: e.cdevento,
      cdTipoEvento: e.cdtipoevento,
      nmEvento: e.nmevento,
      descricao: e.descricao,
      dtEvento: e.dtevento,
      horaEvento: e.horaevento,
      enderecoEvento: e.enderecoevento,
      cdSociedade: e.cdsociedade,
      imagemEvento: e.imagemevento,
      ativo: e.ativo,
      created_at: e.created_at,
      updated_at: e.updated_at,
      nmTipoEvento: e.tipoevento?.nmtipoevento,
      nmSociedade: e.sociedade?.nmsociedade,
      siglaSociedade: e.sociedade?.sigla,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar eventos');
  }
};

// Buscar evento por ID
export const getEventoById = async (
  id: number
): Promise<EventoCompleto | null> => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select(
        `
        *,
        tipoevento:cdtipoevento (
          cdtipoevento,
          nmtipoevento
        ),
        sociedade:cdsociedade (
          cdsociedade,
          nmsociedade,
          sigla
        )
      `
      )
      .eq('cdevento', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      cdEvento: data.cdevento,
      cdTipoEvento: data.cdtipoevento,
      nmEvento: data.nmevento,
      descricao: data.descricao,
      dtEvento: data.dtevento,
      horaEvento: data.horaevento,
      enderecoEvento: data.enderecoevento,
      cdSociedade: data.cdsociedade,
      imagemEvento: data.imagemevento,
      ativo: data.ativo,
      created_at: data.created_at,
      updated_at: data.updated_at,
      nmTipoEvento: data.tipoevento?.nmtipoevento,
      nmSociedade: data.sociedade?.nmsociedade,
      siglaSociedade: data.sociedade?.sigla,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar evento');
  }
};

// Criar novo evento
export const createEvento = async (data: EventoInput): Promise<Eventos> => {
  try {
    const resp = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nmEvento: data.nmEvento,
        cdTipoEvento: data.cdTipoEvento,
        dtEvento: data.dtEvento,
        horaEvento: data.horaEvento,
        enderecoEvento: data.enderecoEvento || null,
        cdSociedade: data.cdSociedade || null,
        descricao: data.descricao || null,
        imagemEvento: data.imagemEvento || null,
        ativo: data.ativo ?? true,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }

    const json = await resp.json();
    const evento = json?.evento;

    return {
      cdEvento: evento.cdevento,
      cdTipoEvento: evento.cdtipoevento,
      nmEvento: evento.nmevento,
      descricao: evento.descricao,
      dtEvento: evento.dtevento,
      horaEvento: evento.horaevento,
      enderecoEvento: evento.enderecoevento,
      cdSociedade: evento.cdsociedade,
      imagemEvento: evento.imagemevento,
      ativo: evento.ativo,
      created_at: evento.created_at,
      updated_at: evento.updated_at,
    };
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar evento');
  }
};

// Atualizar evento
export const updateEvento = async (
  id: number,
  data: Partial<EventoInput>
): Promise<void> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.nmEvento !== undefined) updateData.nmevento = data.nmEvento;
    if (data.cdTipoEvento !== undefined)
      updateData.cdtipoevento = data.cdTipoEvento;
    if (data.dtEvento !== undefined) updateData.dtevento = data.dtEvento;
    if (data.horaEvento !== undefined) updateData.horaevento = data.horaEvento;
    if (data.enderecoEvento !== undefined)
      updateData.enderecoevento = data.enderecoEvento;
    if (data.cdSociedade !== undefined)
      updateData.cdsociedade = data.cdSociedade;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.imagemEvento !== undefined)
      updateData.imagemevento = data.imagemEvento;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    const resp = await fetch(`/api/eventos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar evento');
  }
};

// Excluir evento (desativar)
export const deleteEvento = async (id: number): Promise<void> => {
  try {
    const resp = await fetch(`/api/eventos/${id}/deactivate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(txt || `HTTP ${resp.status}`);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao excluir evento');
  }
};

// Upload de imagem do evento
export const uploadImagemEvento = async (
  file: File,
  eventoId: number
): Promise<string> => {
  try {
    const form = new FormData();
    form.append('file', file, file.name);

    const resp = await fetch(`/api/upload/evento/${eventoId}`, {
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

    // servidor deve retornar { url: '<publicUrl>' } ou similar
    if (!json || !json.url) {
      throw new Error(
        'Resposta inválida do servidor ao fazer upload da imagem do evento'
      );
    }

    return json.url;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao fazer upload da imagem');
  }
};
