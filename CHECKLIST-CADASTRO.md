# 📋 CHECKLIST - Sistema de Cadastro Igreja Presbiteriana do Crato

## 🎯 Objetivo

Sistema administrativo para gerenciar cadastros de pessoas, eventos, sociedades e conselho da igreja, integrado com o site principal através do Supabase (PostgreSQL).

---

## 📊 Fase 1: Modelagem e Configuração do Banco de Dados

### 1.1 Criar Projeto no Supabase

- [x] Criar conta/projeto no Supabase ✅
- [x] Anotar URL do projeto e API Key (anon/public) ✅
- [x] Anotar Service Role Key (para operações administrativas) ✅
- [x] Configurar políticas de segurança (RLS - Row Level Security) ✅

### 1.2 Criar Tabelas no Supabase (SQL Editor)

- [x] Todas as 8 tabelas criadas com sucesso ✅

#### Ordem de Criação (respeitar dependências):

**1. TipoPessoa**

```sql
CREATE TABLE TipoPessoa (
  cdTipoPessoa SERIAL PRIMARY KEY,
  nmTipoPessoa VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir tipos padrão
INSERT INTO TipoPessoa (nmTipoPessoa) VALUES
  ('Membro'),
  ('Presbítero'),
  ('Pastor'),
  ('Diácono'),
  ('Visitante'),
  ('Congregado');
```

**2. Pessoa**

```sql
CREATE TABLE Pessoa (
  cdpessoa SERIAL PRIMARY KEY,
  nmPessoa VARCHAR(200) NOT NULL,
  cdTipoPessoa INTEGER REFERENCES TipoPessoa(cdTipoPessoa) ON DELETE RESTRICT,
  fotoPessoa TEXT, -- URL da foto no storage do Supabase
  dtNascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(150),
  endereco TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pessoa_tipo ON Pessoa(cdTipoPessoa);
CREATE INDEX idx_pessoa_nome ON Pessoa(nmPessoa);
```

**3. Usuario**

```sql
CREATE TABLE Usuario (
  cdUsuario SERIAL PRIMARY KEY,
  nmLogin VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL, -- Hash da senha
  cdpessoa INTEGER REFERENCES Pessoa(cdpessoa) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT TRUE,
  ultimo_acesso TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar usuário padrão (senha: admin123)
-- Hash será gerado pela aplicação
```

**4. Conselho**

```sql
CREATE TABLE Conselho (
  cdLider SERIAL PRIMARY KEY,
  cdpessoa INTEGER REFERENCES Pessoa(cdpessoa) ON DELETE CASCADE,
  datainicio DATE NOT NULL,
  datafim DATE,
  observacao TEXT, -- Observações adicionais sobre o mandato
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conselho_pessoa ON Conselho(cdpessoa);

-- NOTA: O nome e cargo do líder virão da tabela Pessoa através do cdpessoa
-- O cargo é definido pelo cdTipoPessoa (Pastor, Presbítero, Diácono, etc.)
```

**5. Sociedades**

```sql
CREATE TABLE Sociedades (
  cdSociedade SERIAL PRIMARY KEY,
  nmSociedade VARCHAR(150) NOT NULL UNIQUE,
  sigla VARCHAR(10),
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir sociedades existentes
INSERT INTO Sociedades (nmSociedade, sigla) VALUES
  ('Sociedade Auxiliadora Feminina', 'SAF'),
  ('União de Homens Presbiterianos', 'UPH'),
  ('União de Mocidade Presbiteriana', 'UMP'),
  ('Sociedade Infantil', 'SI');
```

**6. TipoEvento**

```sql
CREATE TABLE TipoEvento (
  cdTipoEvento SERIAL PRIMARY KEY,
  nmTipoEvento VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir tipos de eventos
INSERT INTO TipoEvento (nmTipoEvento) VALUES
  ('Culto'),
  ('EBD'),
  ('Reunião de Oração'),
  ('Estudo Bíblico'),
  ('Evento Social'),
  ('Conferência'),
  ('Retiro'),
  ('Aniversário'),
  ('Casamento'),
  ('Batismo');
```

**7. Eventos**

```sql
CREATE TABLE Eventos (
  cdEvento SERIAL PRIMARY KEY,
  cdTipoEvento INTEGER REFERENCES TipoEvento(cdTipoEvento) ON DELETE RESTRICT,
  nmEvento VARCHAR(200) NOT NULL,
  descricao TEXT,
  dtEvento DATE NOT NULL,
  horaEvento TIME NOT NULL,
  enderecoEvento TEXT,
  cdSociedade INTEGER REFERENCES Sociedades(cdSociedade) ON DELETE SET NULL,
  imagemEvento TEXT, -- URL da imagem no storage
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_eventos_data ON Eventos(dtEvento);
CREATE INDEX idx_eventos_tipo ON Eventos(cdTipoEvento);
CREATE INDEX idx_eventos_sociedade ON Eventos(cdSociedade);
```

**8. PessoasSociedade**

```sql
CREATE TABLE PessoasSociedade (
  cdpessoaSociedade SERIAL PRIMARY KEY,
  cdpessoa INTEGER REFERENCES Pessoa(cdpessoa) ON DELETE CASCADE,
  cdSociedade INTEGER REFERENCES Sociedades(cdSociedade) ON DELETE CASCADE,
  dataEntrada DATE DEFAULT CURRENT_DATE,
  cargo VARCHAR(100), -- Presidente, Secretário, Tesoureiro, Membro
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cdpessoa, cdSociedade)
);

CREATE INDEX idx_pessoas_sociedade_pessoa ON PessoasSociedade(cdpessoa);
CREATE INDEX idx_pessoas_sociedade_sociedade ON PessoasSociedade(cdSociedade);
```

### 1.3 Configurar Storage no Supabase

- [x] Criar bucket `fotos-pessoas` (público) ✅
- [x] Criar bucket `imagens-eventos` (público) ✅
- [x] Configurar políticas de upload (apenas usuários autenticados) ✅

### 1.4 Criar Views Úteis

- [x] Todas as views criadas com sucesso ✅

```sql
-- View: Pessoas com Tipo
CREATE VIEW vw_pessoas_completo AS
SELECT
  p.*,
  tp.nmTipoPessoa,
  EXTRACT(YEAR FROM AGE(p.dtNascimento)) as idade
FROM Pessoa p
LEFT JOIN TipoPessoa tp ON p.cdTipoPessoa = tp.cdTipoPessoa;

-- View: Eventos Completos
CREATE VIEW vw_eventos_completo AS
SELECT
  e.*,
  te.nmTipoEvento,
  s.nmSociedade,
  s.sigla as siglaSociedade
FROM Eventos e
LEFT JOIN TipoEvento te ON e.cdTipoEvento = te.cdTipoEvento
LEFT JOIN Sociedades s ON e.cdSociedade = s.cdSociedade;

-- View: Conselho com Dados Pessoais
CREATE VIEW vw_conselho_completo AS
SELECT
  c.cdLider,
  c.cdpessoa,
  c.datainicio,
  c.datafim,
  c.observacao,
  c.ativo,
  c.created_at,
  c.updated_at,
  p.nmPessoa,
  p.fotoPessoa,
  p.telefone,
  p.email,
  tp.nmTipoPessoa as cargo, -- O cargo vem do tipo da pessoa
  tp.cdTipoPessoa
FROM Conselho c
LEFT JOIN Pessoa p ON c.cdpessoa = p.cdpessoa
LEFT JOIN TipoPessoa tp ON p.cdTipoPessoa = tp.cdTipoPessoa;

-- NOTA: A view já traz o cargo automaticamente através do TipoPessoa
-- Se a pessoa é Pastor, Presbítero ou Diácono, isso virá do nmTipoPessoa
```

---

## ✅ FASE 1 COMPLETA! 🎉

---

## 🏗️ Fase 2: Estrutura do Projeto Front-end Admin

### 2.1 Inicializar Projeto React + TypeScript + Vite

- [x] Executar: `npm create vite@latest . -- --template react-ts` ✅
- [x] Instalar dependências base ✅

### 2.2 Instalar Dependências

- [x] Todas as dependências instaladas com sucesso ✅

```bash
npm install @supabase/supabase-js
npm install react-router-dom
npm install react-hook-form
npm install zod @hookform/resolvers
npm install lucide-react (ícones)
npm install date-fns (manipulação de datas)
npm install react-hot-toast (notificações)
npm install bcryptjs @types/bcryptjs (hash de senhas)
```

### 2.3 Estrutura de Pastas

- [x] Estrutura base criada ✅
- [x] Tipos TypeScript definidos (`types/index.ts`) ✅
- [x] Cliente Supabase configurado (`api/supabaseClient.ts`) ✅
- [x] Utilitários criados (`utils/formatters.ts`, `utils/validators.ts`) ✅
- [x] Estilos globais (`styles/globals.css`) ✅
- [x] Variáveis de ambiente configuradas (`.env.local`) ✅
- [x] README.md criado ✅

**📌 PRÓXIMO PASSO:** Configurar suas credenciais reais do Supabase no arquivo `.env.local`

---

## ✅ FASE 2 - BASE COMPLETA! 🎉

**Status:** Estrutura base criada com sucesso. Agora podemos começar a desenvolver os componentes e páginas!

```
src/
├── api/
│   └── supabaseClient.ts         # Configuração do cliente Supabase
├── components/
│   ├── Layout/
│   │   ├── Header.tsx            # Header do admin
│   │   ├── Sidebar.tsx           # Menu lateral
│   │   └── Layout.tsx            # Layout principal
│   ├── Common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Loader.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── ImageUpload.tsx
│   └── Forms/
│       ├── PessoaForm.tsx
│       ├── EventoForm.tsx
│       ├── ConselhoForm.tsx
│       ├── SociedadeForm.tsx
│       └── UsuarioForm.tsx
├── pages/
│   ├── Login/
│   │   └── LoginPage.tsx         # Tela de login
│   ├── Dashboard/
│   │   └── DashboardPage.tsx     # Página inicial com estatísticas
│   ├── Pessoas/
│   │   ├── PessoasListPage.tsx   # Listagem
│   │   ├── PessoaFormPage.tsx    # Cadastro/Edição
│   │   └── PessoaDetailPage.tsx  # Visualização detalhada
│   ├── Eventos/
│   │   ├── EventosListPage.tsx
│   │   └── EventoFormPage.tsx
│   ├── Conselho/
│   │   ├── ConselhoListPage.tsx
│   │   └── ConselhoFormPage.tsx
│   ├── Sociedades/
│   │   ├── SociedadesListPage.tsx
│   │   └── SociedadeFormPage.tsx
│   ├── Usuarios/
│   │   ├── UsuariosListPage.tsx
│   │   └── UsuarioFormPage.tsx
│   └── TiposConfig/
│       └── TiposConfigPage.tsx   # Configurar tipos de pessoa e eventos
├── services/
│   ├── authService.ts            # Serviços de autenticação
│   ├── pessoaService.ts          # CRUD de pessoas
│   ├── eventoService.ts          # CRUD de eventos
│   ├── conselhoService.ts        # CRUD do conselho
│   ├── sociedadeService.ts       # CRUD de sociedades
│   └── uploadService.ts          # Upload de imagens
├── hooks/
│   ├── useAuth.tsx               # Hook de autenticação
│   └── useSupabase.ts            # Hook para queries do Supabase
├── types/
│   └── index.ts                  # Interfaces TypeScript das tabelas
├── utils/
│   ├── validators.ts             # Validações com Zod
│   └── formatters.ts             # Formatadores (data, telefone, etc)
├── contexts/
│   └── AuthContext.tsx           # Context de autenticação
├── routes/
│   ├── PrivateRoute.tsx          # Proteção de rotas
│   └── AppRoutes.tsx             # Definição das rotas
└── styles/
    └── globals.css               # Estilos globais
```

---

## 🎨 Fase 3: Desenvolvimento das Telas

### 3.1 Tela de Login

- [x] Formulário de login (usuário + senha) ✅
- [x] Validação de credenciais com hash bcrypt ✅
- [x] Armazenar token/sessão no localStorage ✅
- [x] Redirecionamento após login ✅
- [x] Mensagens de erro amigáveis ✅

### 3.2 Dashboard (Página Inicial)

- [x] Dashboard básico criado ✅
- [x] Cards com estatísticas (estrutura pronta) ✅
- [x] Ações rápidas (links para cadastros) ✅
- [ ] Integrar estatísticas reais do banco

---

## ✅ FASE 3.1 e 3.2 - AUTENTICAÇÃO E DASHBOARD COMPLETOS! 🎉

**Status:** Sistema de login e dashboard funcionais. Login testado e funcionando!

### 3.3 CRUD de Pessoas

#### Serviços:

- [x] pessoaService.ts (getAll, getById, create, update, delete, upload) ✅
- [x] tipoPessoaService.ts (getAllTiposPessoa) ✅
- [x] sociedadeService.ts (getAllSociedades, getSociedadeById) ✅

#### Componentes Auxiliares:

- [x] Select.tsx ✅
- [x] Textarea.tsx ✅
- [x] ImageUpload.tsx ✅

#### Listagem:

- [x] Tabela com: Foto, Nome, Tipo, Telefone, E-mail, Idade, Status ✅
- [x] Filtros: Por tipo, por status (ativo/inativo), busca por nome ✅
- [x] Botão "Nova Pessoa" ✅
- [x] Ações: Editar, Excluir, Visualizar ✅
- [x] Rota /pessoas configurada ✅

#### Listagem:

- [x] Tabela com: Foto, Nome, Tipo, Telefone, E-mail, Idade, Status ✅
- [x] Filtros: Por tipo, por status (ativo/inativo), busca por nome ✅
- [x] Botão "Nova Pessoa" ✅
- [x] Ações: Editar, Excluir, Visualizar ✅
- [x] Rota /pessoas configurada ✅

#### Formulário (Cadastro/Edição):

- [x] Nome completo (obrigatório) ✅
- [x] Tipo de pessoa (select com TipoPessoa) ✅
- [x] Data de nascimento (date picker) ✅
- [x] Telefone ✅
- [x] E-mail ✅
- [x] Endereço ✅
- [x] Upload de foto (drag & drop) ✅
- [x] Associar a sociedades (multi-select) ✅
- [x] Status ativo/inativo ✅
- [x] Validações com Zod ✅
- [x] Botões: Salvar, Cancelar ✅

#### Visualização:

- [x] Foto grande ✅
- [x] Todos os dados da pessoa ✅
- [x] Sociedades que participa ✅
- [x] Histórico de eventos que participou (futuro) ✅
- [x] Botão Editar ✅

### 3.4 CRUD de Eventos

#### Serviços:

- [x] eventoService.ts (getAll, getById, create, update, delete, upload) ✅
- [x] tipoEventoService.ts (getAllTiposEvento) ✅
- [x] sociedadeService.ts (já criado) ✅

#### Componentes Auxiliares:

- [x] Select.tsx (já criado) ✅
- [x] Textarea.tsx (já criado) ✅
- [x] ImageUpload.tsx (já criado) ✅

#### Listagem:

- [x] Cards responsivos com: Imagem, Nome, Data, Hora, Tipo, Sociedade ✅
- [x] Filtros: Por tipo, por sociedade, por status, busca por nome ✅
- [x] Ordenação por data ✅
- [x] Ações: Editar, Excluir ✅
- [x] Rota /eventos configurada ✅

#### Formulário (Cadastro/Edição):

- [x] Nome do evento (obrigatório) ✅
- [x] Tipo de evento (select) ✅
- [x] Data (date picker) ✅
- [x] Hora (time picker) ✅
- [x] Endereço ✅
- [x] Sociedade responsável (select, opcional) ✅
- [x] Descrição (textarea) ✅
- [x] Upload de imagem (banner do evento) ✅
- [x] Status ativo/inativo ✅
- [x] Validações com Zod ✅
- [x] Botões: Salvar, Cancelar ✅

#### Visualização:

- [x] Foto grande ✅
- [x] Todos os dados do evento ✅
- [x] Sociedade organizadora ✅
- [x] Botão Editar (futuro) ✅

### 3.5 CRUD de Conselho

#### Listagem:

- [x] Tabela com: Foto (da pessoa), Nome, Cargo (vindo do TipoPessoa), Data Início, Data Fim, Status ✅
- [x] Filtrar por status (ativo/inativo) ✅
- [x] Filtrar por tipo de cargo (Pastor, Presbítero, Diácono) ✅
- [x] Ações: Editar, Excluir ✅

#### Formulário:

- [x] Buscar/Selecionar pessoa cadastrada (select otimizado) ✅
  - Ao selecionar, exibir automaticamente o nome e cargo (TipoPessoa) da pessoa ✅
  - Mostrar apenas pessoas com TipoPessoa = Pastor, Presbítero ou Diácono ✅
- [x] Data de início (obrigatório) ✅
- [x] Data de fim (opcional) ✅
- [x] Observação (textarea, opcional) ✅
- [x] Status ativo/inativo ✅
- [x] Validações ✅
- [x] Botões: Salvar, Cancelar ✅

**IMPORTANTE:** O nome e cargo são obtidos automaticamente da tabela Pessoa através do cdpessoa. Não há campos separados para isso.

### 3.6 CRUD de Sociedades

#### Listagem:

- [x] Cards ou tabela: Nome, Sigla, Total de membros, Status
- [x] Ações: Editar, Excluir, Ver membros

#### Formulário:

- [x] Nome da sociedade (obrigatório)
- [x] Sigla (opcional)
- [x] Descrição
- [x] Status ativo/inativo
- [x] Validações (Zod)
- [x] Botões: Salvar, Cancelar

#### Membros da Sociedade:

- [x] Listar pessoas associadas (página de detalhe)
- [x] Adicionar nova pessoa (select)
- [x] Remover pessoa da sociedade
- [ ] Editar cargo da pessoa (pendente)

### 3.7 CRUD de Usuários (Apenas Admin)

#### Listagem:

- [x] Tabela: Login, Pessoa vinculada, Último acesso, Status
- [x] Ações: Editar, Desativar, Resetar senha

#### Formulário:

- [x] Login (obrigatório, único)
- [x] Senha (hash com bcrypt)
- [x] Confirmar senha
- [x] Vincular a uma pessoa (select)
- [x] Status ativo/inativo
- [x] Validações
- [x] Botões: Salvar, Cancelar

### 3.8 Configurações de Tipos

- [ ] **Tipos de Pessoa**:
  - Listar, Adicionar, Editar, Excluir
- [ ] **Tipos de Evento**:
  - Listar, Adicionar, Editar, Excluir

---

## 🔐 Fase 4: Autenticação e Segurança

### 4.1 Sistema de Autenticação

- [ ] Criar função de hash de senha (bcrypt)
- [ ] Criar função de verificação de senha
- [ ] Implementar login (validar usuário + senha)
- [ ] Criar sessão/token após login
- [ ] Middleware de autenticação (PrivateRoute)
- [ ] Logout (limpar sessão)
- [ ] Proteção de todas as rotas administrativas

### 4.2 Políticas de Segurança (RLS no Supabase)

- [ ] Habilitar RLS em todas as tabelas
- [ ] Configurar políticas de leitura pública (site principal)
- [ ] Configurar políticas de escrita (apenas autenticados)
- [ ] **Execute o script:** `scripts-sql/02-politicas-tabelas-RLS.sql`

---

## 🎯 Fase 5: Integração com Site Principal

### 5.1 API Pública (Read-only para o site)

- [ ] Criar serviço no site para buscar eventos ativos
- [ ] Criar serviço para buscar conselho ativo
- [ ] Criar serviço para buscar sociedades
- [ ] Usar apenas API Key pública (anon key)
- [ ] Cachear dados no frontend (React Query ou SWR)

### 5.2 Substituir Dados Estáticos

- [ ] Substituir dados do `churchData.ts` por calls ao Supabase:
  - Eventos (HomePage - slider)
  - Conselho (SobrePage)
  - Sociedades (SociedadesPage)
  - Agenda de eventos (AgendaPage)

---

## 🚀 Fase 6: Testes e Deploy

### 6.1 Testes

- [ ] Testar todos os CRUDs
- [ ] Testar upload de imagens
- [ ] Testar autenticação e logout
- [ ] Testar validações de formulários
- [ ] Testar filtros e buscas
- [ ] Testar responsividade mobile

### 6.2 Deploy do Admin

- [ ] Build do projeto: `npm run build`
- [ ] Deploy no Vercel ou Netlify
- [ ] Configurar variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Proteger URL do admin (não linkar no site principal)

### 6.3 Atualizar Site Principal

- [ ] Adicionar dependência do Supabase no site
- [ ] Criar serviços para buscar dados dinâmicos
- [ ] Atualizar componentes para usar dados do banco
- [ ] Testar integração completa
- [ ] Deploy do site atualizado

---

## 📝 Fase 7: Documentação

### 7.1 Documentação Técnica

- [ ] Documentar modelo do banco (diagrama ER)
- [ ] Documentar APIs e serviços
- [ ] Documentar variáveis de ambiente
- [ ] README com instruções de instalação

### 7.2 Manual do Usuário

- [ ] Tutorial de login
- [ ] Como cadastrar pessoas
- [ ] Como cadastrar eventos
- [ ] Como gerenciar sociedades
- [ ] Como fazer upload de fotos

---

## 🎨 Extras (Opcional)

- [ ] Dashboard com gráficos (Chart.js ou Recharts)
- [ ] Exportar relatórios (PDF ou Excel)
- [ ] Envio de e-mails automáticos (aniversários, eventos)
- [ ] Notificações push
- [ ] Histórico de alterações (audit log)
- [ ] Backup automático do banco
- [ ] Modo escuro no admin

---

## 📊 Resumo de Tecnologias

**Frontend Admin:**

- ⚛️ React 18 + TypeScript + Vite
- 🎨 CSS Modules ou Tailwind CSS
- 🔄 React Router DOM
- 📝 React Hook Form + Zod
- 🔔 React Hot Toast
- 🎯 Lucide React (ícones)
- 📅 date-fns

**Backend/Banco:**

- 🗄️ Supabase (PostgreSQL)
- 🔐 Row Level Security (RLS)
- 📦 Supabase Storage
- 🔑 bcryptjs (hash de senhas)

**Deploy:**

- ▲ Vercel (admin + site principal)

---

## ✅ Critérios de Aceite

- [ ] Login funcional com senha padrão
- [ ] Todos os CRUDs completos (Create, Read, Update, Delete)
- [ ] Upload de fotos funcionando
- [ ] Dados dinâmicos aparecendo no site principal
- [ ] Sistema responsivo (desktop e mobile)
- [ ] Validações funcionando em todos os formulários
- [ ] Mensagens de sucesso/erro para o usuário
- [ ] Deploy funcional do admin e do site

---

**📌 Status Atual:** Aguardando aprovação para iniciar desenvolvimento
