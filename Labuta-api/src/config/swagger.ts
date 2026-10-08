import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Labuta API", version: "1.0.0", description: "API REST da plataforma Labuta para contratação de serviços." },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1`, description: "Servidor local" }],
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Error: { type: "object", properties: { error: { type: "string" } } },
        User: { type: "object", properties: { id: { type: "string", format: "uuid" }, name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, city: { type: "string" }, role: { type: "string", enum: ["CLIENT", "PROFESSIONAL", "ADMIN"] }, status: { type: "string", enum: ["ACTIVE", "SUSPENDED"] } } },
      },
    },
    paths: {
      "/users/me": {
        get: { tags: ["Usuários"], summary: "Consultar a própria conta", security: [{ bearerAuth: [] }], responses: { "200": { description: "Dados públicos da conta" } } },
        patch: { tags: ["Usuários"], summary: "Atualizar a própria conta", security: [{ bearerAuth: [] }], responses: { "200": { description: "Conta atualizada" }, "400": { description: "Dados inválidos" } } },
      },
      "/professionals": { get: { tags: ["Profissionais"], summary: "Buscar profissionais", parameters: ["city", "profession", "q", "available"].map((name) => ({ in: "query", name, schema: { type: "string" } })), responses: { "200": { description: "Lista de perfis profissionais" } } } },
      "/professionals/{id}": {
        get: { tags: ["Profissionais"], summary: "Consultar perfil profissional", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Perfil profissional" }, "404": { description: "Perfil não encontrado" } } },
      },
      "/professionals/me": { put: { tags: ["Profissionais"], summary: "Criar ou atualizar perfil profissional", security: [{ bearerAuth: [] }], responses: { "200": { description: "Perfil salvo" } } } },
      "/professionals/{id}/reviews": { get: { tags: ["Avaliações"], summary: "Listar avaliações do profissional", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Lista de avaliações" } } } },
      "/requests": {
        get: { tags: ["Solicitações"], summary: "Listar solicitações da conta autenticada", security: [{ bearerAuth: [] }], responses: { "200": { description: "Solicitações do usuário" } } },
        post: { tags: ["Solicitações"], summary: "Criar solicitação de serviço ou orçamento (cliente ou profissional)", security: [{ bearerAuth: [] }], responses: { "201": { description: "Solicitação criada" } } },
      },
      "/requests/{id}": { patch: { tags: ["Solicitações"], summary: "Atualizar status ou orçamento", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Solicitação atualizada" }, "403": { description: "Ação não permitida" } } } },
      "/messages": {
        get: { tags: ["Mensagens"], summary: "Listar mensagens da conta", security: [{ bearerAuth: [] }], responses: { "200": { description: "Mensagens enviadas e recebidas" } } },
        post: { tags: ["Mensagens"], summary: "Enviar mensagem", security: [{ bearerAuth: [] }], responses: { "201": { description: "Mensagem enviada" } } },
      },
      "/messages/{id}/read": { patch: { tags: ["Mensagens"], summary: "Marcar mensagem como lida", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "204": { description: "Mensagem marcada como lida" } } } },
      "/auth/logout": { post: { tags: ["Autenticação"], summary: "Registrar logout na auditoria", security: [{ bearerAuth: [] }], responses: { "204": { description: "Logout registrado" } } } },
      "/reviews": { post: { tags: ["Avaliações"], summary: "Avaliar uma solicitação concluída", security: [{ bearerAuth: [] }], responses: { "201": { description: "Avaliação registrada" }, "409": { description: "Solicitação ainda não concluída ou já avaliada" } } } },
      "/admin/dashboard": { get: { tags: ["Administração"], summary: "Consultar indicadores administrativos", security: [{ bearerAuth: [] }], responses: { "200": { description: "Indicadores" } } } },
      "/admin/users": { get: { tags: ["Administração"], summary: "Listar usuários", security: [{ bearerAuth: [] }], responses: { "200": { description: "Usuários paginados" } } } },
      "/admin/users/{id}/status": { patch: { tags: ["Administração"], summary: "Suspender ou reativar usuário", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Status atualizado" } } } },
      "/admin/requests": { get: { tags: ["Administração"], summary: "Listar solicitações da plataforma", security: [{ bearerAuth: [] }], responses: { "200": { description: "Solicitações paginadas" } } } },
      "/admin/audit": { get: { tags: ["Administração"], summary: "Consultar eventos de auditoria", security: [{ bearerAuth: [] }], responses: { "200": { description: "Eventos paginados" } } } },
      "/admin/audit/{id}/resolve": { patch: { tags: ["Administração"], summary: "Resolver evento de auditoria", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid" } }], responses: { "200": { description: "Evento resolvido" } } } },
    },
    tags: ["Autenticação", "Usuários", "Profissionais", "Solicitações", "Mensagens", "Avaliações", "Administração"].map((name) => ({ name })),
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
});