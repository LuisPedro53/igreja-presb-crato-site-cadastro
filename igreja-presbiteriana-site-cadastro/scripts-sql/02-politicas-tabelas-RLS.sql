-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS) PARA TABELAS
-- Igreja Presbiteriana do Crato
-- ============================================
-- IMPORTANTE: Execute este script APÓS criar todas as tabelas

-- ============================================
-- HABILITAR RLS em todas as tabelas
-- ============================================

ALTER TABLE TipoPessoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE Pessoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE Usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE Conselho ENABLE ROW LEVEL SECURITY;
ALTER TABLE Sociedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE TipoEvento ENABLE ROW LEVEL SECURITY;
ALTER TABLE Eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE PessoasSociedade ENABLE ROW LEVEL SECURITY;


-- ============================================
-- POLÍTICAS PARA LEITURA PÚBLICA (Anon Key)
-- Site principal pode LER dados sem autenticação
-- ============================================

-- TipoPessoa: Leitura pública
CREATE POLICY "Qualquer pessoa pode ler tipos de pessoa"
ON TipoPessoa FOR SELECT
TO public
USING (true);

-- Pessoa: Leitura pública (apenas pessoas ativas)
CREATE POLICY "Qualquer pessoa pode ler pessoas ativas"
ON Pessoa FOR SELECT
TO public
USING (ativo = true);

-- Conselho: Leitura pública (apenas membros ativos)
CREATE POLICY "Qualquer pessoa pode ler conselho ativo"
ON Conselho FOR SELECT
TO public
USING (ativo = true);

-- Sociedades: Leitura pública (apenas sociedades ativas)
CREATE POLICY "Qualquer pessoa pode ler sociedades ativas"
ON Sociedades FOR SELECT
TO public
USING (ativo = true);

-- TipoEvento: Leitura pública
CREATE POLICY "Qualquer pessoa pode ler tipos de evento"
ON TipoEvento FOR SELECT
TO public
USING (true);

-- Eventos: Leitura pública (apenas eventos ativos)
CREATE POLICY "Qualquer pessoa pode ler eventos ativos"
ON Eventos FOR SELECT
TO public
USING (ativo = true);

-- PessoasSociedade: Leitura pública (apenas relações ativas)
CREATE POLICY "Qualquer pessoa pode ler pessoas em sociedades ativas"
ON PessoasSociedade FOR SELECT
TO public
USING (ativo = true);


-- ============================================
-- POLÍTICAS PARA USUÁRIOS AUTENTICADOS
-- Sistema admin pode fazer INSERT, UPDATE, DELETE
-- ============================================

-- TipoPessoa: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir tipos de pessoa"
ON TipoPessoa FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar tipos de pessoa"
ON TipoPessoa FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar tipos de pessoa"
ON TipoPessoa FOR DELETE
TO authenticated
USING (true);


-- Pessoa: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir pessoas"
ON Pessoa FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pessoas"
ON Pessoa FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar pessoas"
ON Pessoa FOR DELETE
TO authenticated
USING (true);


-- Usuario: Usuários autenticados podem ler e modificar
CREATE POLICY "Usuários autenticados podem ler usuários"
ON Usuario FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir usuários"
ON Usuario FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar usuários"
ON Usuario FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar usuários"
ON Usuario FOR DELETE
TO authenticated
USING (true);


-- Conselho: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir membros do conselho"
ON Conselho FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar membros do conselho"
ON Conselho FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar membros do conselho"
ON Conselho FOR DELETE
TO authenticated
USING (true);


-- Sociedades: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir sociedades"
ON Sociedades FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar sociedades"
ON Sociedades FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar sociedades"
ON Sociedades FOR DELETE
TO authenticated
USING (true);


-- TipoEvento: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir tipos de evento"
ON TipoEvento FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar tipos de evento"
ON TipoEvento FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar tipos de evento"
ON TipoEvento FOR DELETE
TO authenticated
USING (true);


-- Eventos: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir eventos"
ON Eventos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar eventos"
ON Eventos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar eventos"
ON Eventos FOR DELETE
TO authenticated
USING (true);


-- PessoasSociedade: Usuários autenticados podem fazer tudo
CREATE POLICY "Usuários autenticados podem inserir pessoas em sociedades"
ON PessoasSociedade FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar pessoas em sociedades"
ON PessoasSociedade FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem deletar pessoas de sociedades"
ON PessoasSociedade FOR DELETE
TO authenticated
USING (true);


-- ============================================
-- VERIFICAR POLÍTICAS CRIADAS
-- ============================================
-- Execute para ver todas as políticas:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;


-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. TO public = qualquer pessoa (site principal com anon key)
-- 2. TO authenticated = apenas usuários autenticados (sistema admin)
-- 3. USING = condição para SELECT/UPDATE/DELETE
-- 4. WITH CHECK = condição para INSERT/UPDATE
-- 5. true = sempre permitido (sem condições extras)
--
-- 6. Estas políticas permitem:
--    - Site público: LER apenas dados ativos
--    - Admin autenticado: CRUD completo em tudo
