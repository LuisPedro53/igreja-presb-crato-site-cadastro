import { z } from 'zod';

// ============================================
// VALIDAÇÕES COM ZOD
// ============================================

// Mensagens de erro personalizadas
const requiredMessage = 'Este campo é obrigatório';
const invalidEmailMessage = 'E-mail inválido';
const invalidPhoneMessage = 'Telefone inválido';
const minLengthMessage = (min: number) => `Mínimo de ${min} caracteres`;
const maxLengthMessage = (max: number) => `Máximo de ${max} caracteres`;

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

// PESSOA
export const pessoaSchema = z.object({
  nmPessoa: z
    .string()
    .min(3, minLengthMessage(3))
    .max(200, maxLengthMessage(200)),
  cdTipoPessoa: z.number().min(1, 'Selecione um tipo válido'),
  dtNascimento: z.string().optional(),
  telefone: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(val.replace(/\D/g, '')),
      { message: invalidPhoneMessage }
    ),
  email: z.string().email(invalidEmailMessage).optional().or(z.literal('')),
  endereco: z.string().max(500, maxLengthMessage(500)).optional(),
  ativo: z.boolean().default(true),
});

export type PessoaFormData = z.infer<typeof pessoaSchema>;

// EVENTO
export const eventoSchema = z.object({
  nmEvento: z
    .string()
    .min(3, minLengthMessage(3))
    .max(200, maxLengthMessage(200)),
  cdTipoEvento: z.number().min(1, 'Selecione um tipo válido'),
  dtEvento: z.string().min(1, requiredMessage),
  horaEvento: z.string().min(1, requiredMessage),
  enderecoEvento: z.string().max(500, maxLengthMessage(500)).optional(),
  cdSociedade: z.number().optional().nullable(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type EventoFormData = z.infer<typeof eventoSchema>;

// CONSELHO
export const conselhoSchema = z
  .object({
    cdpessoa: z.number().min(1, 'Selecione uma pessoa'),
    datainicio: z.string().min(1, requiredMessage),
    datafim: z.string().optional().nullable(),
    observacao: z.string().max(1000, maxLengthMessage(1000)).optional(),
    ativo: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validar se datafim é maior que datainicio
      if (data.datafim && data.datainicio) {
        return new Date(data.datafim) >= new Date(data.datainicio);
      }
      return true;
    },
    {
      message: 'Data de término deve ser maior ou igual à data de início',
      path: ['datafim'],
    }
  );

export type ConselhoFormData = z.infer<typeof conselhoSchema>;

// SOCIEDADE
export const sociedadeSchema = z.object({
  nmSociedade: z
    .string()
    .min(3, minLengthMessage(3))
    .max(150, maxLengthMessage(150)),
  sigla: z.string().max(10, maxLengthMessage(10)).optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type SociedadeFormData = z.infer<typeof sociedadeSchema>;

// USUÁRIO
export const usuarioSchema = z
  .object({
    nmLogin: z
      .string()
      .min(3, minLengthMessage(3))
      .max(100, maxLengthMessage(100))
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Use apenas letras, números, ponto, hífen ou underscore'
      ),
    senha: z
      .string()
      .min(6, minLengthMessage(6))
      .max(100, maxLengthMessage(100)),
    confirmarSenha: z.string(),
    cdpessoa: z.number().optional().nullable(),
    ativo: z.boolean().default(true),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  });

export type UsuarioFormData = z.infer<typeof usuarioSchema>;

// LOGIN
export const loginSchema = z.object({
  nmLogin: z.string().min(1, 'Informe o usuário'),
  senha: z.string().min(1, 'Informe a senha'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// TIPO DE PESSOA
export const tipoPessoaSchema = z.object({
  nmTipoPessoa: z
    .string()
    .min(3, minLengthMessage(3))
    .max(100, maxLengthMessage(100)),
});

export type TipoPessoaFormData = z.infer<typeof tipoPessoaSchema>;

// TIPO DE EVENTO
export const tipoEventoSchema = z.object({
  nmTipoEvento: z
    .string()
    .min(3, minLengthMessage(3))
    .max(100, maxLengthMessage(100)),
});

export type TipoEventoFormData = z.infer<typeof tipoEventoSchema>;

// ============================================
// VALIDAÇÕES CUSTOMIZADAS
// ============================================

export const validateFile = (
  file: File | null,
  maxSizeMB: number = 5
): string | null => {
  if (!file) return null;

  // Validar tamanho
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`;
  }

  // Validar tipo (imagens)
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  if (!validTypes.includes(file.type)) {
    return 'Tipo de arquivo inválido. Use: JPG, PNG, GIF ou WEBP';
  }

  return null;
};

export const validateDateRange = (
  startDate: string,
  endDate: string
): boolean => {
  if (!startDate || !endDate) return true;
  return new Date(endDate) >= new Date(startDate);
};
