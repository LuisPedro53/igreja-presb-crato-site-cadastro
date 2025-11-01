import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não configuradas! ' +
      'Crie um arquivo .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

// Criar e exportar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Exportar URL para uso em outros lugares (ex: construir URLs de imagens)
export const SUPABASE_URL = supabaseUrl;

// Helpers para construir URLs de imagens do Storage
export const getStorageUrl = (bucket: string, path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

export const getFotoPessoaUrl = (path: string | null | undefined) => {
  if (!path) return null;
  return getStorageUrl('fotos-pessoas', path);
};

export const getImagemEventoUrl = (path: string | null | undefined) => {
  if (!path) return null;
  return getStorageUrl('imagens-eventos', path);
};
