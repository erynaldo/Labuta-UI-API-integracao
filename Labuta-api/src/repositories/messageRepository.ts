import { prisma } from "../config/prisma.js";

export class MessageRepository {
  listForUser(userId: string) {
    return prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: { sender: { select: { id: true, name: true, phone: true } }, receiver: { select: { id: true, name: true, phone: true } }, request: { select: { id: true, kind: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  create(data: { senderId: string; receiverId: string; requestId?: string; content: string }) {
    return prisma.message.create({ data, include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } } });
  }

  markRead(id: string, receiverId: string) {
    return prisma.message.updateMany({ where: { id, receiverId }, data: { readAt: new Date() } });
  }
}

export const messageRepository = new MessageRepository();