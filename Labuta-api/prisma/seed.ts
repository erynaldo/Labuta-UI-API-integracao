import bcrypt from "bcryptjs";
import { UserRole } from "../src/generated/prisma/client.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";

const professions = [
  "Eletricista", "Encanador", "Pintor", "Pedreiro", "Carpinteiro", "Jardineiro",
  "Servente de obras", "Instalação de ar-condicionado", "Montagem de móveis", "Dedetização",
];

async function main() {
  for (const name of professions) {
    await prisma.profession.upsert({ where: { name }, create: { name }, update: {} });
  }

  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: env.ADMIN_EMAIL.toLowerCase() },
      create: { name: "Administrador do Sistema", email: env.ADMIN_EMAIL.toLowerCase(), phone: "(86)98174-1234", city: "Brasileira", passwordHash, role: UserRole.ADMIN, cpf: "01256489703" },
      update: {},
    });
  }

  console.info(`Seed concluído. ${professions.length} profissões cadastradas.`);
}

main().catch((error: unknown) => {
  console.error("Falha ao executar seed:", error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());