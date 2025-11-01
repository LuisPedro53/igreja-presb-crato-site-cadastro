// ============================================
// TIPOS E INTERFACES DO BANCO DE DADOS
// Igreja Presbiteriana do Crato
// ============================================

// ============================================
// TABELAS PRINCIPAIS
// ============================================

export interface TipoPessoa {
  cdTipoPessoa: number;
  nmTipoPessoa: string;
  created_at?: string;
  updated_at?: string;
}

export interface Pessoa {
  cdpessoa: number;
  nmPessoa: string;
  cdTipoPessoa: number;
  fotoPessoa?: string | null;
  dtNascimento?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  cdUsuario: number;
  nmLogin: string;
  senha: string;
  cdpessoa?: number | null;
  ativo: boolean;
  ultimo_acesso?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Conselho {
  cdLider: number;
  cdpessoa: number;
  datainicio: string;
  datafim?: string | null;
  observacao?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Sociedades {
  cdSociedade: number;
  nmSociedade: string;
  sigla?: string | null;
  descricao?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TipoEvento {
  cdTipoEvento: number;
  nmTipoEvento: string;
  created_at?: string;
  updated_at?: string;
}

export interface Eventos {
  cdEvento: number;
  cdTipoEvento: number;
  nmEvento: string;
  descricao?: string | null;
  dtEvento: string;
  horaEvento: string;
  enderecoEvento?: string | null;
  cdSociedade?: number | null;
  imagemEvento?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PessoasSociedade {
  cdpessoaSociedade: number;
  cdpessoa: number;
  cdSociedade: number;
  dataEntrada: string;
  cargo?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// VIEWS (Dados Completos)
// ============================================

export interface PessoaCompleta extends Pessoa {
  nmTipoPessoa: string;
  idade?: number;
}

export interface EventoCompleto extends Eventos {
  nmTipoEvento: string;
  nmSociedade?: string;
  siglaSociedade?: string;
}

export interface ConselhoCompleto extends Conselho {
  nmPessoa: string;
  fotoPessoa?: string | null;
  telefone?: string | null;
  email?: string | null;
  cargo: string; // nmTipoPessoa
  cdTipoPessoa: number;
}

// ============================================
// TIPOS PARA FORMULÁRIOS (Input)
// ============================================

export interface PessoaInput {
  nmPessoa: string;
  cdTipoPessoa: number;
  dtNascimento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  fotoPessoa?: File | string | null;
  ativo?: boolean;
  sociedades?: number[]; // Array de cdSociedade
}

export interface EventoInput {
  nmEvento: string;
  cdTipoEvento: number;
  dtEvento: string;
  horaEvento: string;
  enderecoEvento?: string;
  cdSociedade?: number | null;
  descricao?: string;
  imagemEvento?: File | string | null;
  ativo?: boolean;
}

export interface ConselhoInput {
  cdpessoa: number;
  datainicio: string;
  datafim?: string | null;
  observacao?: string;
  ativo?: boolean;
}

export interface SociedadeInput {
  nmSociedade: string;
  sigla?: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UsuarioInput {
  nmLogin: string;
  senha: string;
  confirmarSenha?: string;
  cdpessoa?: number | null;
  ativo?: boolean;
}

// ============================================
// TIPOS DE AUTENTICAÇÃO
// ============================================

export interface LoginCredentials {
  nmLogin: string;
  senha: string;
}

export interface AuthUser {
  cdUsuario: number;
  nmLogin: string;
  cdpessoa?: number | null;
  ativo: boolean;
  nomePessoa?: string; // Nome da pessoa vinculada
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ============================================
// TIPOS PARA DASHBOARD/ESTATÍSTICAS
// ============================================

export interface DashboardStats {
  totalMembros: number;
  totalEventosMes: number;
  aniversariantesMes: number;
  membrosPorSociedade: {
    sociedade: string;
    total: number;
  }[];
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export interface SelectOption {
  value: number | string;
  label: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  search?: string;
  cdTipoPessoa?: number;
  cdSociedade?: number;
  ativo?: boolean;
  datainicio?: string;
  datafim?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
