import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js"; 

const server = app.listen(env.PORT, () => {
  console.info(`API disponível em http://localhost:${env.PORT}/api`);
  console.info(`Swagger UI: http://localhost:${env.PORT}/api/docs`);
});

const shutdown = (signal: string) => {
  console.info(`${signal} recebido. Encerrando servidor...`);
  server.close(() => { void prisma.$disconnect().finally(() => process.exit(0)); });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));