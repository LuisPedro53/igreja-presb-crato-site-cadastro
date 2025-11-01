import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// FORMATADORES DE DATA
// ============================================

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '-';
  }
};

export const formatDateTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '-';
  }
};

export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '-';
  try {
    // Time vem no formato HH:mm:ss do PostgreSQL
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return time;
  }
};

// Converter data de DD/MM/YYYY para YYYY-MM-DD (formato do banco)
export const dateToISO = (date: string): string => {
  if (!date) return '';
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

// Converter data de YYYY-MM-DD para DD/MM/YYYY
export const isoToDate = (iso: string): string => {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
};

// ============================================
// FORMATADORES DE TELEFONE
// ============================================

export const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return '-';

  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');

  // Formata (88) 99999-9999 ou (88) 9999-9999
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
};

export const cleanPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// ============================================
// FORMATADORES DE TEXTO
// ============================================

export const capitalizeFirst = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const truncateText = (
  text: string | null | undefined,
  maxLength: number
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ============================================
// FORMATADORES DE STATUS
// ============================================

export const formatStatus = (ativo: boolean): string => {
  return ativo ? 'Ativo' : 'Inativo';
};

export const getStatusColor = (ativo: boolean): string => {
  return ativo ? 'green' : 'red';
};

// ============================================
// VALIDADORES
// ============================================

export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = cleanPhone(phone);
  return cleaned.length === 10 || cleaned.length === 11;
};

export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;

  // Validação básica de CPF
  if (/^(\d)\1+$/.test(cleaned)) return false;

  return true; // Implementar validação completa se necessário
};

// ============================================
// HELPERS DE ARQUIVO
// ============================================

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (file: File): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const extension = getFileExtension(file.name);
  return validExtensions.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// ============================================
// HELPERS DE URL
// ============================================

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
};
