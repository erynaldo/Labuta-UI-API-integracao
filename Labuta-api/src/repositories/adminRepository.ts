import { prisma } from "../config/prisma.js";

export class AdminRepository {
  async dashboard() {
    const [users, professionals, requests, flaggedAudits] = await Promise.all([
      prisma.user.count(),
      prisma.professionalProfile.count(),
      prisma.serviceRequest.count(),
      prisma.auditEvent.count({ where: { flagged: true, resolvedAt: null } }),
    ]);
    return { users, professionals, requests, flaggedAudits };
  }

  users(page: number, limit: number) {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, city: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    });
  }

  listRequests(page: number, limit: number) {
    return prisma.serviceRequest.findMany({
      include: { client: { select: { id: true, name: true } }, professional: { include: { user: { select: { id: true, name: true } }, profession: true } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    });
  }

  listAudit(page: number, limit: number) {
    return prisma.auditEvent.findMany({
      include: { actor: { select: { id: true, name: true } }, subjectUser: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit,
    });
  }

  setUserStatus(id: string, status: "ACTIVE" | "SUSPENDED", actorId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: { status }, select: { id: true, name: true, email: true, role: true, status: true } });
      await tx.auditEvent.create({ data: { actorId, subjectUserId: id, action: status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_REACTIVATED" } });
      return user;
    });
  }

  async resolveAudit(id: string, actorId: string) {
    const event = await prisma.auditEvent.update({ where: { id }, data: { resolvedAt: new Date() } });
    await prisma.auditEvent.create({ data: { actorId, subjectUserId: event.subjectUserId, action: "AUDIT_EVENT_RESOLVED", details: `Evento ${id}` } });
    return event;
  }

  async flagAudit(id: string, flagged: boolean, actorId: string) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.auditEvent.update({ where: { id }, data: { flagged } });
      await tx.auditEvent.create({ data: { actorId, subjectUserId: event.subjectUserId, action: flagged ? "AUDIT_EVENT_FLAGGED" : "AUDIT_EVENT_UNFLAGGED", details: `Evento ${id}` } });
      return event;
    });
  }
}

export const adminRepository = new AdminRepository();