import { prisma } from "../config/prisma.js";

const requestInclude = {
  client: { select: { id: true, name: true, phone: true, city: true } },
  professional: { include: { user: { select: { id: true, name: true, phone: true } }, profession: true } },
} as const;

export class ServiceRequestRepository {
  create(data: { clientId: string; professionalId: string; kind: "QUOTE" | "SERVICE"; description: string; desiredDate?: Date; attachmentUrl?: string }) {
    return prisma.serviceRequest.create({ data, include: requestInclude });
  }

  listForUser(userId: string, role: "CLIENT" | "PROFESSIONAL") {
    const where = role === "CLIENT" ? { clientId: userId } : { professional: { userId } };
    return prisma.serviceRequest.findMany({ where, include: requestInclude, orderBy: { createdAt: "desc" } });
  }

  findById(id: string) {
    return prisma.serviceRequest.findUnique({ where: { id }, include: requestInclude });
  }

  update(id: string, data: { status: "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED"; quotedPrice?: number }) {
    return prisma.serviceRequest.update({ where: { id }, data, include: requestInclude });
  }
}

export const serviceRequestRepository = new ServiceRequestRepository();