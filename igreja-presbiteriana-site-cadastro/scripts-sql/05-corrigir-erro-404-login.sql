-- ============================================
-- DIAGNÓSTICO E CORREÇÃO - ERRO 404 NO LOGIN
-- ============================================

-- PASSO 1: Verificar se o RLS está bloqueando
-- Execute cada comando separadamente:

-- 1.1 - Verificar se a tabela usuario existe
SELECT * FROM usuario LIMIT 1;

-- 1.2 - Verificar se o RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'usuario';

-- 1.3 - Ver as políticas atuais
SELECT * FROM pg_policies WHERE tablename = 'usuario';

-- ============================================
-- SOLUÇÃO 1: DESABILITAR RLS TEMPORARIAMENTE
-- (Apenas para teste - não recomendado em produção)
-- ============================================

ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE pessoa DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SOLUÇÃO 2: ADICIONAR POLÍTICA PERMISSIVA
-- (Recomendado - permite acesso público apenas para login)
-- ============================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem ler usuários" ON usuario;
DROP POLICY IF EXISTS "Qualquer pessoa pode ler pessoas ativas" ON pessoa;

-- Criar política que permite leitura da tabela usuario para fazer login
-- IMPORTANTE: Isso é necessário para o processo de login funcionar
CREATE POLICY "Permitir leitura para autenticação"
ON usuario FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir leitura de pessoa para buscar o nome vinculado
CREATE POLICY "Permitir leitura de pessoas para autenticação"
ON pessoa FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================
-- PASSO 2: ATUALIZAR A SENHA COM HASH CORRETO
-- ============================================

UPDATE usuario 
SET senha = '$2b$10$oriuJqhIzosOfMeox0RTQu82QtoSpwx9h4ZsYSLbQtmt7qJFlWgkq'
WHERE nmLogin = 'admin';

-- ============================================
-- PASSO 3: VERIFICAR SE FUNCIONOU
-- ============================================

-- Este comando deve retornar o usuário admin
SELECT 
  u.cdUsuario,
  u.nmLogin,
  u.ativo,
  p.nmPessoa,
  LENGTH(u.senha) as tamanho_hash
FROM usuario u
LEFT JOIN pessoa p ON u.cdpessoa = p.cdpessoa
WHERE u.nmLogin = 'admin';

-- Resultado esperado:
-- tamanho_hash = 60 (hash bcrypt válido)
-- ativo = true
-- deve mostrar os dados do usuário

-- ============================================
-- PASSO 4 (OPCIONAL): CRIAR FUNÇÃO PARA LOGIN
-- Caso ainda tenha problemas, podemos usar uma função SQL
-- ============================================

/*
CREATE OR REPLACE FUNCTION public.fazer_login(
  p_login text,
  p_senha text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_usuario json;
BEGIN
  SELECT json_build_object(
    'cdUsuario', u.cdUsuario,
    'nmLogin', u.nmLogin,
    'cdpessoa', u.cdpessoa,
    'ativo', u.ativo,
    'nomePessoa', p.nmPessoa,
    'senha', u.senha
  ) INTO v_usuario
  FROM usuario u
  LEFT JOIN pessoa p ON u.cdpessoa = p.cdpessoa
  WHERE u.nmLogin = p_login AND u.ativo = true;
  
  RETURN v_usuario;
END;
$$;

-- Conceder permissão para usar a função
GRANT EXECUTE ON FUNCTION public.fazer_login TO anon, authenticated;
*/

-- ============================================
-- RESUMO DAS AÇÕES
-- ============================================

-- ✅ Execute na ordem:
-- 1. SOLUÇÃO 2 (políticas RLS)
-- 2. PASSO 2 (atualizar senha)
-- 3. PASSO 3 (verificar)
-- 4. Testar login no sistema

-- Se ainda não funcionar, execute SOLUÇÃO 1 (desabilitar RLS temporariamente)
