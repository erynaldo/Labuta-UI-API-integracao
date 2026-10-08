import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../exception/AppError.js";
import { prisma } from "../config/prisma.js";

export class UserService {
  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("Usuário não encontrado.", 404);
    return user;
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string; city?: string; cpf?: string; role?: "CLIENT" | "PROFESSIONAL"; available?: boolean }) {
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) throw new AppError("Este e-mail já está em uso.", 409);
    }
    const existingUser = await userRepository.findById(id);
    if (!existingUser) throw new AppError("Usuário não encontrado.", 404);
    const profile = await prisma.professionalProfile.findUnique({ where: { userId: id }, select: { id: true, documentType: true } });
    const role = data.role ?? existingUser.role;
    if (role === "PROFESSIONAL" && !profile) {
      throw new AppError("Cadastre seu perfil profissional antes de alterar o tipo da conta.", 409);
    }
    if (data.available !== undefined && !profile) {
      throw new AppError("Cadastre seu perfil profissional antes de alterar sua disponibilidade.", 409);
    }
    const { available, ...userData } = data;
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: userData,
        select: { id: true, name: true, email: true, phone: true, city: true, cpf: true, role: true, status: true, createdAt: true, professionalProfile: { select: { available: true, documentType: true, documentNumber: true } } },
      });
      if (profile && (available !== undefined || role === "CLIENT" || (data.cpf && profile.documentType === "CPF"))) {
        await tx.professionalProfile.update({
          where: { userId: id },
          data: {
            ...(available !== undefined || role === "CLIENT" ? { available: role === "CLIENT" ? false : available } : {}),
            ...(data.cpf && profile.documentType === "CPF" && { documentNumber: data.cpf }),
          },
        });
      }
      return user;
    });
    await prisma.auditEvent.create({ data: { actorId: id, subjectUserId: id, action: "USER_PROFILE_UPDATED" } });
    if (profile && updatedUser.professionalProfile) {
      return { ...updatedUser, professionalProfile: { ...updatedUser.professionalProfile, available: role === "CLIENT" ? false : available ?? updatedUser.professionalProfile.available } };
    }
    return updatedUser;
  }
}

export const userService = new UserService();