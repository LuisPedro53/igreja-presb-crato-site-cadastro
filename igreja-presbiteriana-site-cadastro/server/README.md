Server para inserts privilegiados na tabela `pessoa`.

Como usar (local):

1. Copie o arquivo `.env.example` para `.env` dentro de `server/` e preencha:

   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   PORT=3001

2. Instale dependências e rode:

   cd server
   npm install
   npm run start

3. Endpoint:

   POST http://localhost:3001/api/pessoa
   Content-Type: application/json

   Body exemplo:
   {
   "nmpessoa": "João Silva",
   "cdtipopessoa": 1,
   "email": "joao@exemplo.com"
   }

Observações de segurança:

- A service_role key tem privilégios totais e deve ser mantida fora do código-fonte.
- No ambiente de produção, prefira usar Supabase Edge Functions ou um backend seguro (serverless) com a service_role key guardada em variáveis de ambiente do provedor.
- Rotacione a service_role key se ela vazar.
