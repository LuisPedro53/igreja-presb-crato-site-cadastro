-- ============================================
-- VERIFICAR NOMES EXATOS DAS COLUNAS
-- ============================================
-- Execute isso para ver os nomes EXATOS das colunas
-- PostgreSQL pode ter convertido para minúsculas!
-- ============================================

-- Ver colunas da tabela USUARIO
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuario' 
ORDER BY ordinal_position;

-- Ver colunas da tabela PESSOA
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pessoa' 
ORDER BY ordinal_position;

-- ============================================
-- DEPOIS QUE SOUBERMOS OS NOMES CORRETOS:
-- ============================================

-- Atualizar senha
UPDATE usuario 
SET senha = '$2b$10$oriuJqhIzosOfMeox0RTQu82QtoSpwx9h4ZsYSLbQtmt7qJFlWgkq'
WHERE nmlogin = 'admin';  -- ou nmLogin, dependendo do resultado acima

-- Verificar
SELECT * FROM usuario WHERE nmlogin = 'admin';  -- ou nmLogin
