-- ============================================
-- POLÍTICAS DE SEGURANÇA PARA STORAGE
-- Igreja Presbiteriana do Crato
-- ============================================

-- 1. HABILITAR RLS nos buckets (se necessário)
-- Nota: Normalmente os buckets já vêm com RLS habilitado

-- ============================================
-- BUCKET: fotos-pessoas
-- ============================================

-- Política: Qualquer pessoa AUTENTICADA pode fazer UPLOAD
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de pessoas"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fotos-pessoas');

-- Política: Qualquer pessoa AUTENTICADA pode ATUALIZAR fotos
CREATE POLICY "Usuários autenticados podem atualizar fotos de pessoas"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'fotos-pessoas')
WITH CHECK (bucket_id = 'fotos-pessoas');

-- Política: Qualquer pessoa AUTENTICADA pode DELETAR fotos
CREATE POLICY "Usuários autenticados podem deletar fotos de pessoas"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'fotos-pessoas');

-- Política: Qualquer pessoa (público) pode LER/BAIXAR fotos
-- (Já que o bucket é público, essa política permite acesso via URL pública)
CREATE POLICY "Qualquer pessoa pode visualizar fotos de pessoas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fotos-pessoas');


-- ============================================
-- BUCKET: imagens-eventos
-- ============================================

-- Política: Qualquer pessoa AUTENTICADA pode fazer UPLOAD
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de eventos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagens-eventos');

-- Política: Qualquer pessoa AUTENTICADA pode ATUALIZAR imagens
CREATE POLICY "Usuários autenticados podem atualizar imagens de eventos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'imagens-eventos')
WITH CHECK (bucket_id = 'imagens-eventos');

-- Política: Qualquer pessoa AUTENTICADA pode DELETAR imagens
CREATE POLICY "Usuários autenticados podem deletar imagens de eventos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'imagens-eventos');

-- Política: Qualquer pessoa (público) pode LER/BAIXAR imagens
CREATE POLICY "Qualquer pessoa pode visualizar imagens de eventos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'imagens-eventos');


-- ============================================
-- VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- ============================================
-- Execute esta query para listar todas as políticas dos buckets:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';

-- ============================================
-- OPCIONAL: Se precisar REMOVER alguma política:
-- ============================================
-- DROP POLICY "nome_da_politica" ON storage.objects;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Os buckets precisam estar marcados como "públicos" no Supabase Dashboard
--    para que as URLs das imagens funcionem sem autenticação.
--
-- 2. As políticas acima permitem que:
--    - APENAS usuários autenticados façam upload/edição/exclusão
--    - TODOS (incluindo não autenticados) possam VISUALIZAR as imagens
--
-- 3. Se você quiser restringir ainda mais (por exemplo, apenas admins podem deletar),
--    você pode adicionar condições extras nas políticas.
