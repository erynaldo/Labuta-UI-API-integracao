import { AppError } from "../exception/AppError.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { serviceRequestRepository } from "../repositories/serviceRequestRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { prisma } from "../config/prisma.js";

export class MessageService {
  list(userId: string) { return messageRepository.listForUser(userId); }

  async create(senderId: string, input: { receiverId: string; requestId?: string; content: string }) {
    if (senderId === input.receiverId) throw new AppError("Não é possível enviar mensagem para si mesmo.");
    if (!(await userRepository.findById(input.receiverId))) throw new AppError("Destinatário não encontrado.", 404);
    if (input.requestId) {
      const request = await serviceRequestRepository.findById(input.requestId);
      if (!request) throw new AppError("Solicitação não encontrada.", 404);
      const participants = new Set([request.clientId, request.professional.user.id]);
      if (!participants.has(senderId) || !participants.has(input.receiverId)) throw new AppError("Apenas participantes da solicitação podem vinculá-la à mensagem.", 403);
    }
    const message = await messageRepository.create({ ...input, senderId });
    await prisma.auditEvent.create({ data: { actorId: senderId, subjectUserId: input.receiverId, action: "MESSAGE_SENT", details: input.requestId ? `Solicitação ${input.requestId}` : undefined } });
    return message;
  }

  async markRead(messageId: string, userId: string) {
    const result = await messageRepository.markRead(messageId, userId);
    if (!result.count) throw new AppError("Mensagem não encontrada.", 404);
  }
}

export const messageService = new MessageService();