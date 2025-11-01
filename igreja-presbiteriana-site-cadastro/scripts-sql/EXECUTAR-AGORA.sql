-- ============================================
-- EXECUTAR ESTES COMANDOS NO SUPABASE AGORA
-- ============================================
-- IMPORTANTE: Todas as colunas estão em MINÚSCULAS!
-- ============================================

-- ATUALIZAR SENHA COM HASH BCRYPT
-- --------------------------------------------

UPDATE usuario 
SET senha = '$2b$10$oriuJqhIzosOfMeox0RTQu82QtoSpwx9h4ZsYSLbQtmt7qJFlWgkq'
WHERE nmlogin = 'admin';


-- VERIFICAR SE FUNCIONOU
-- --------------------------------------------

SELECT 
  u.cdusuario,
  u.nmlogin,
  u.ativo,
  p.nmpessoa,
  LENGTH(u.senha) as tamanho_hash
FROM usuario u
LEFT JOIN pessoa p ON u.cdpessoa = p.cdpessoa
WHERE u.nmlogin = 'admin';

-- Resultado esperado:
-- tamanho_hash = 60
-- ativo = true
-- Deve mostrar os dados do usuário

-- ============================================
-- DEPOIS DE EXECUTAR, RECARREGUE A PÁGINA
-- E TENTE FAZER LOGIN COM:
-- Login: admin
-- Senha: adminpresb1A*
-- ============================================
