import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const connectionUrl = new URL(env.DATABASE_URL);
const sslMode = connectionUrl.searchParams.get("sslmode");
const usesLibpqCompat = connectionUrl.searchParams.get("uselibpqcompat") === "true";

if (["prefer", "require", "verify-ca"].includes(sslMode ?? "") && !usesLibpqCompat) {
  connectionUrl.searchParams.set("sslmode", "verify-full");
}

const adapter = new PrismaPg({ connectionString: connectionUrl.toString() });
export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});