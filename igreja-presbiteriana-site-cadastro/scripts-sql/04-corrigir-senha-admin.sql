-- ============================================
-- CORRIGIR SENHA DO USUÁRIO ADMIN
-- ============================================

-- A senha precisa estar em formato HASH bcrypt, não texto puro!

-- Hash bcrypt para a senha: adminpresb1A*
-- Execute este comando no Supabase SQL Editor:

UPDATE Usuario 
SET senha = '$2a$10$FVqz0F5cYjKlQ0ZC0mZVVe5pN7jWZ5XQz9qGZ5qZ5qZ5qZ5qZ5qZ5'
WHERE nmLogin = 'admin';

-- ============================================
-- ATENÇÃO: O hash acima é um EXEMPLO
-- Você precisa gerar o hash correto para 'adminpresb1A*'
-- ============================================

-- OPÇÃO 1: Usar gerador online (RÁPIDO)
-- 1. Acesse: https://bcrypt-generator.com/
-- 2. Digite: adminpresb1A*
-- 3. Rounds: 10
-- 4. Copie o hash gerado
-- 5. Execute o UPDATE acima com o hash real

-- OPÇÃO 2: Usar Node.js
-- Execute no terminal do projeto:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('adminpresb1A*', 10).then(console.log);"

-- Copie o hash gerado e execute:
-- UPDATE Usuario SET senha = 'HASH_GERADO_AQUI' WHERE nmLogin = 'admin';

-- ============================================
-- VERIFICAR APÓS ATUALIZAR
-- ============================================

SELECT 
  u.nmLogin,
  u.ativo,
  p.nmPessoa,
  LENGTH(u.senha) as tamanho_hash
FROM Usuario u
LEFT JOIN Pessoa p ON u.cdpessoa = p.cdpessoa
WHERE u.nmLogin = 'admin';

-- O tamanho_hash deve ser 60 caracteres (hash bcrypt válido)
-- Se for menor, está errado!
