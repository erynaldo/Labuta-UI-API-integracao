import type { ErrorRequestHandler } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: "Dados inválidos.", details: error.flatten().fieldErrors });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "Já existe um registro com esses dados." });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ error: "Registro não encontrado." });
      return;
    }
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor.", ...(env.NODE_ENV === "development" && { details: String(error) }) });
};