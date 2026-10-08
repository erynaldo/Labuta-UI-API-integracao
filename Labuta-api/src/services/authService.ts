import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../exception/AppError.js";
import { userRepository } from "../repositories/userRepository.js";
import { prisma } from "../config/prisma.js";

export class AuthService {
  async logout(userId: string) {
    await prisma.auditEvent.create({
      data: { actorId: userId, subjectUserId: userId, action: "USER_LOGOUT" },
    });
  }

  async register(input: { name: string; email: string; phone: string; city: string; password: string }) {
    if (await userRepository.findByEmail(input.email)) throw new AppError("Este e-mail já está cadastrado.", 409);
    const { password, ...userData } = input;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({ ...userData, passwordHash });
    await prisma.auditEvent.create({ data: { actorId: user.id, subjectUserId: user.id, action: "USER_REGISTERED" } });
    return this.createSession(user);
  }

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError("E-mail ou senha inválidos.", 401);
    if (user.status !== "ACTIVE") throw new AppError("Esta conta está suspensa.", 403);
    await prisma.auditEvent.create({ data: { actorId: user.id, subjectUserId: user.id, action: "USER_LOGIN" } });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { token: this.token(user.id, user.role), user: safeUser };
  }

  private createSession(user: { id: string; role: "CLIENT" | "PROFESSIONAL" | "ADMIN" } & Record<string, unknown>) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { token: this.token(user.id, user.role), user: safeUser };
  }

  private token(userId: string, role: string) {
    return jwt.sign({ role }, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
  }
}

export const authService = new AuthService();