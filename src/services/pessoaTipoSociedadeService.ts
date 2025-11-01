// Service para tipos de cargo em sociedades

export const getAllPessoaTipoSociedade = async (): Promise<any[]> => {
  try {
    const resp = await fetch('/api/pessoatiposociedade');
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json?.tipos || [];
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao buscar tipos de cargo');
  }
};

export const createPessoaTipoSociedade = async (nmcargo: string) => {
  try {
    const resp = await fetch('/api/pessoatiposociedade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmcargo }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json?.tipo;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao criar tipo de cargo');
  }
};

export const updatePessoaTipoSociedade = async (
  id: number,
  nmcargo: string
) => {
  try {
    const resp = await fetch(`/api/pessoatiposociedade/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nmcargo }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    return json?.tipo;
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao atualizar tipo de cargo');
  }
};

export const deletePessoaTipoSociedade = async (id: number) => {
  try {
    const resp = await fetch(`/api/pessoatiposociedade/${id}`, {
      method: 'DELETE',
    });
    if (!resp.ok && resp.status !== 204) throw new Error(`HTTP ${resp.status}`);
  } catch (error: any) {
    throw new Error(error.message || 'Erro ao deletar tipo de cargo');
  }
};
