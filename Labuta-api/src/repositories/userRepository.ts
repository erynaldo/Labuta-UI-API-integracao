import { UserRole, type Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";

const publicUser = { id: true, name: true, email: true, phone: true, city: true, cpf: true, role: true, status: true, createdAt: true, professionalProfile: { select: { available: true, documentType: true, documentNumber: true } } } satisfies Prisma.UserSelect;

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: publicUser });
  }

  create(data: { name: string; email: string; phone: string; city: string; passwordHash: string }) {
    return prisma.user.create({ data, select: publicUser });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: publicUser });
  }

  async updateRole(id: string, role: UserRole) {
    return prisma.user.update({ where: { id }, data: { role }, select: publicUser });
  }
}

export const userRepository = new UserRepository();