# Labuta API

API RESTFul do sistema Labuta, construída com Node.js, Express, TypeScript, Prisma ORM 7 e PostgreSQL.

## Requisitos

- Node.js 20.19 ou superior
- PostgreSQL 14 ou superior

## Configuração 

No diretório `Labuta-api`, instale as dependências e crie seu arquivo `.env` com base em `.env.example`. 

Configure `DATABASE_URL` para o PostgreSQL e defina um `JWT_SECRET` aleatório com pelo menos 32 caracteres. 

Em produção, use `sslmode=verify-full` na `DATABASE_URL` para validar o certificado TLS do servidor PostgreSQL. Para evitar avisos do driver sem enfraquecer essa validação, a API converte automaticamente `sslmode=prefer`, `require` e `verify-ca` para `verify-full`, exceto quando `uselibpqcompat=true` foi configurado explicitamente.

Para provisionar o usuário administrador, configure também `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres). 

A conexão do Prisma CLI é definida em `prisma.config.ts`; em tempo de execução, a API usa o adaptador PostgreSQL `@prisma/adapter-pg`.

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

A API inicia em `http://localhost:3000`; documentação interativa em `http://localhost:3000/api/docs`, verificação do status do sistema em `/status`.

## Endpoints

Todos os endpoints de negócio usam o prefixo `/api/v1`.

| Método | Caminho | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | `/professionals` | Público | Buscar profissionais (`city`, `profession`, `q`, `available`) |
| GET | `/professionals/:id` | Público | Detalhar perfil profissional |
| GET | `/professionals/:id/reviews` | Público | Listar avaliações |


<!-- | POST | `/auth/register` | Público | Criar conta de contratante |
| POST | `/auth/login` | Público | Autenticar usuário ou administrador |
| GET, PATCH | `/users/me` | Autenticado | Consultar/atualizar a própria conta |
| PUT | `/professionals/me` | Autenticado | Criar/atualizar perfil profissional | -->

<!-- | GET, POST | `/requests` | Autenticado | Listar solicitações próprias/criar solicitação |
| PATCH | `/requests/:id` | Participante/Admin | Aceitar, concluir, recusar ou cancelar solicitação |
| GET, POST | `/messages` | Autenticado | Listar/enviar mensagens |
| PATCH | `/messages/:id/read` | Destinatário | Marcar mensagem como lida |
| POST | `/reviews` | Contratante | Avaliar solicitação concluída |
| GET | `/admin/dashboard`, `/admin/users`, `/admin/requests`, `/admin/audit` | Admin | Consultar painel administrativo |
| PATCH | `/admin/users/:id/status`, `/admin/audit/:id/flag`, `/admin/audit/:id/resolve` | Admin | Moderar contas, sinalizar eventos e resolver auditoria | -->

Rotas protegidas recebem `Authorization: Bearer <token>`. Tipos de usuário são `CLIENT`, `PROFESSIONAL` e `ADMIN`; a criação de perfil promove a conta para profissional. A API armazena URLs de anexos e imagens; o armazenamento dos arquivos deve ser integrado a um provedor externo.

## Modelagem

- `User` tem um perfil opcional `ProfessionalProfile` e pode atuar como contratante, profissional ou administrador.
- `Profession` categoriza perfis; `ProfessionalService` e `PortfolioItem` detalham serviços e portfólio.
- `ServiceRequest` relaciona contratante e perfil profissional, com status e orçamento.
- `Message` relaciona remetente/destinatário e, opcionalmente, uma solicitação.
- `Review` pertence a uma solicitação concluída e relaciona autor e profissional.
- `AuditEvent` registra cadastros, criação de solicitações, mensagens, perfis profissionais e ações administrativas.

<!-- Senhas são armazenadas com bcrypt. -->
Tokens JWT e suspensão de contas são validados no servidor; credenciais administrativas não são incluídas no código.