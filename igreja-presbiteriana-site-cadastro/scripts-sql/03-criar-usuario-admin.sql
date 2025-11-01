-- ============================================
-- CRIAR USUÁRIO ADMIN INICIAL
-- Igreja Presbiteriana do Crato
-- ============================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- APÓS criar todas as tabelas

-- Passo 1: Inserir uma pessoa para vincular ao usuário (opcional)
INSERT INTO Pessoa (nmPessoa, cdTipoPessoa, telefone, email, ativo)
VALUES (
  'Administrador',
  (SELECT cdTipoPessoa FROM TipoPessoa WHERE nmTipoPessoa = 'Pastor' LIMIT 1),
  '(88) 99999-9999',
  'admin@igrejapresbiterianacrato.com',
  true
)
RETURNING cdpessoa;

-- Anote o cdpessoa retornado acima (exemplo: 1)

-- Passo 2: Criar usuário admin
-- NOTA: A senha 'admin123' será hashada no próximo passo
-- Por enquanto, vamos inserir um hash bcrypt para 'admin123'

INSERT INTO Usuario (
  nmLogin,
  senha,
  cdpessoa,
  ativo
)
VALUES (
  'admin',
  '$2a$10$YQjKMxR6V5Z6k5YqJ5Z5YeZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5', -- Placeholder - precisa ser gerado
  (SELECT cdpessoa FROM Pessoa WHERE nmPessoa = 'Administrador' LIMIT 1),
  true
);

-- ============================================
-- ALTERNATIVA: Criar usuário SEM pessoa vinculada
-- ============================================

-- Se preferir criar o usuário sem vincular a uma pessoa:

/*
INSERT INTO Usuario (
  nmLogin,
  senha,
  cdpessoa,
  ativo
)
VALUES (
  'admin',
  '$2a$10$HASH_AQUI', -- Hash da senha precisa ser gerado
  NULL, -- Sem pessoa vinculada
  true
);
*/

-- ============================================
-- COMO GERAR O HASH DA SENHA
-- ============================================

-- A aplicação React usa bcrypt para gerar o hash.
-- Você tem 3 opções:

-- OPÇÃO 1: Usar a aplicação (RECOMENDADO)
-- 1. Acesse o sistema pela primeira vez
-- 2. Faça login com qualquer credencial (vai falhar)
-- 3. Entre em contato com o desenvolvedor para gerar o hash

-- OPÇÃO 2: Usar um gerador online de bcrypt
-- 1. Acesse: https://bcrypt-generator.com/
-- 2. Digite: admin123
-- 3. Rounds: 10
-- 4. Copie o hash gerado
-- 5. Cole no campo 'senha' acima

-- OPÇÃO 3: Usar Node.js localmente
-- 1. Instale bcryptjs: npm install bcryptjs
-- 2. Execute no terminal Node:
--    const bcrypt = require('bcryptjs');
--    bcrypt.hash('admin123', 10).then(console.log);
-- 3. Copie o hash gerado

-- ============================================
-- EXEMPLO DE HASH PARA 'admin123' (válido)
-- ============================================

-- Hash bcrypt para a senha 'admin123':
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Então você pode usar:

UPDATE Usuario 
SET senha = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE nmLogin = 'admin';

-- ============================================
-- VERIFICAR SE O USUÁRIO FOI CRIADO
-- ============================================

SELECT 
  u.cdUsuario,
  u.nmLogin,
  u.ativo,
  p.nmPessoa
FROM Usuario u
LEFT JOIN Pessoa p ON u.cdpessoa = p.cdpessoa
WHERE u.nmLogin = 'admin';

-- ============================================
-- CREDENCIAIS DE ACESSO
-- ============================================

-- Usuário: admin
-- Senha: admin123

-- IMPORTANTE: Após o primeiro acesso, altere a senha!
