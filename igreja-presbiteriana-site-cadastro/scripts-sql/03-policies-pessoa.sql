-- 03-policies-pessoa.sql
-- Políticas RLS mínimas para a tabela "pessoa"
-- Execute este script no SQL Editor do Supabase (como usuário administrador)

-- 1) Ativar RLS (se ainda não estiver ativa)
-- ALTER TABLE pessoa ENABLE ROW LEVEL SECURITY;

-- 2) Permitir SELECT para usuários autenticados
DROP POLICY IF EXISTS "select_authenticated_on_pessoa" ON pessoa;
CREATE POLICY "select_authenticated_on_pessoa"
  ON pessoa
  FOR SELECT
  TO authenticated
  USING (true);

-- 3) Permitir INSERT apenas para usuários autenticados
DROP POLICY IF EXISTS "insert_authenticated_on_pessoa" ON pessoa;
CREATE POLICY "insert_authenticated_on_pessoa"
  ON pessoa
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4) Permitir UPDATE apenas para usuários autenticados
DROP POLICY IF EXISTS "update_authenticated_on_pessoa" ON pessoa;
CREATE POLICY "update_authenticated_on_pessoa"
  ON pessoa
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5) Permitir DELETE apenas para usuários autenticados
DROP POLICY IF EXISTS "delete_authenticated_on_pessoa" ON pessoa;
CREATE POLICY "delete_authenticated_on_pessoa"
  ON pessoa
  FOR DELETE
  TO authenticated
  USING (true);

-- Observações:
-- - Estas políticas são relativamente permissivas (autenticados podem inserir/atualizar/deletar).
-- - Para produção, recomendo ajustar as expressões USING/WITH CHECK para restringir
--   ações apenas ao usuário dono do registro (ex.: created_by = auth.uid()) ou a roles específicas.
