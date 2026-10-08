# Labuta

Aplicação com front-end React/Vite, API Express/Prisma e PostgreSQL.

## Preparação

Requisitos: Node.js 20+ e PostgreSQL 14+.

1. Instale as dependências em cada pacote:

```powershell
npm install --prefix .\Labuta-api
npm install --prefix .\Labuta-ui
```

2. Em `Labuta-api`, copie `.env.example` para `.env` e ajuste `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. A senha do administrador deve ter pelo menos 12 caracteres.
3. Prepare o banco e a conta administrativa: 

```powershell
npm run db:generate --prefix .\Labuta-api
npm run db:migrate --prefix .\Labuta-api
npm run db:seed --prefix .\Labuta-api
```

## Desenvolvimento

Na raiz deste repositório, execute:

```powershell
npm run dev
```

O comando inicia a API em `http://localhost:3000` e o front-end em `http://localhost:5173`. 

A documentação da API fica em `http://localhost:3000/api/docs`; 

Verifica-se o status da conexão PostgreSQL em `http://localhost:3000/status`.

O front aceita `VITE_API_URL` para sobrescrever o endereço padrão `http://localhost:3000/api/v1`. O CORS da API é configurado por `CORS_ORIGIN` no `.env`.
