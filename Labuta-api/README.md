# Backend da Aplicação

## Labuta API

API RESTFul do sistema Labuta, construida com Node.js, Express, TypeScript, Prisma ORM e PostgreSQL.

## Requisitos

- Node.js 20.19 ou superior
- PostgreSQL 14 ou superior

## Configuração 

- No diretório `Labuta-api`, instale as dependências e crie seu arquivo `.env` com base em `.env.example`. 
- Configure `DATABASE_URL` para o PostgreSQL e defina um `JWT_SECRET` aleatório com pelo menos 32 caracteres. 
- Para provisionar o usuário administrador, no `.env` configure também `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo de 12 caracteres). 


```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

- A API inicia em `http://localhost:3000/api`.
- Documentação interativa em `http://localhost:3000/api/docs`. 
- Verificar status do sistema e conexão com o banco de dados `http://localhost:3000/api/status`.

## Arquitetura e respostas HTTP

O backend segue uma organização RESTFul em camadas: `routes` mapeia os endpoints HTTP para `controllers`; os controllers validam as entradas com schemas Zod em `dtos` e delegam as operações aos `services`, onde ficam as regras de negócio. Os services usam `repositories` para acesso a dados com Prisma. Erros de validação, regras de negócio e banco de dados são tratados por `exception` e pelo middleware global de erros.

O middleware HTTP registra no console o método, o caminho, o código, a descrição do status e quando cada resposta termina. Por exemplo: `[HTTP] POST /api/auth/register - 201 CREATED`. Isso inclui respostas de sucesso e de erro, como `400 BAD REQUEST`, `404 NOT FOUND` ou `502 BAD GATEWAY` quando esse status for retornado.

## Endpoints

Todos os endpoints de negócio usam o prefixo `/api`.

| Método | Caminho | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register` | Público | Criar conta de contratante |
| POST | `/auth/login` | Público | Autenticar usuário ou administrador |
| GET, PATCH | `/users/me` | Autenticado | Consultar/atualizar a própria conta |
| PUT | `/professionals/me` | Autenticado | Criar/atualizar perfil profissional |
| GET | `/professionals` | Público | Buscar profissionais (`city`, `profession`, `q`, `available`) |
| GET | `/professionals/:id` | Público | Detalhar perfil profissional |
| GET | `/professionals/:id/reviews` | Público | Listar avaliações |
| POST | `/reviews` | Contratante | Avaliar solicitação concluída |
| GET, POST | `/requests` | Autenticado | Listar solicitações próprias/criar solicitação |
| PATCH | `/requests/:id` | Participante/Admin | Aceitar, concluir, recusar ou cancelar solicitação |
| GET, POST | `/messages` | Autenticado | Listar/enviar mensagens |
| PATCH | `/messages/:id/read` | Destinatário | Marcar mensagem como lida |
| GET | `/admin/dashboard`, `/admin/users`, `/admin/requests`, `/admin/audit` | Admin | Consultar painel administrativo |
| PATCH | `/admin/users/:id/status`, `/admin/audit/:id/flag`, `/admin/audit/:id/resolve` | Admin | Moderar contas, sinalizar eventos e resolver auditoria |


Rotas protegidas recebem `Authorization: Bearer <token>`. Tipos de usuário são `CLIENT`, `PROFESSIONAL` e `ADMIN`; a criação de perfil promove a conta para profissional.

## Modelagem

- `User` tem um perfil opcional `ProfessionalProfile` e pode atuar como contratante, profissional ou administrador.
- `Profession` categoriza perfis; `ProfessionalService` e `PortfolioItem` detalham serviços e portfólio.
- `ServiceRequest` relaciona contratante e perfil profissional, com status e orçamento.
- `Message` relaciona remetente/destinatário e, opcionalmente, uma solicitação.
- `Review` pertence a uma solicitação concluída e relaciona autor e profissional.
- `AuditEvent` registra cadastros, criação de solicitações, mensagens, perfis profissionais e ações administrativas.

Senhas são armazenadas com bcrypt.
Tokens JWT e suspensão de contas são validados no servidor; credenciais administrativas não são incluídas no código.