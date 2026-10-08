import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export const authenticate: RequestHandler = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization ?? "").split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Autenticação necessária." });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub || !Object.values(UserRole).includes(payload.role as UserRole)) {
      res.status(401).json({ error: "Token inválido." });
      return;
    }
    void prisma.user.findUnique({ where: { id: payload.sub }, select: { role: true, status: true } }).then((user) => {
      if (!user || user.status !== "ACTIVE") {
        res.status(401).json({ error: "Sessão inválida ou conta suspensa." });
        return;
      }
      req.auth = { userId: payload.sub!, role: user.role };
      next();
    }).catch(next);
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

export const authorize = (...roles: UserRole[]): RequestHandler => (req, res, next) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    res.status(403).json({ error: "Você não tem permissão para acessar este recurso." });
    return;
  }
  next();
};