import { AppError } from "../exception/AppError.js";
import { professionalRepository } from "../repositories/professionalRepository.js";
import { serviceRequestRepository } from "../repositories/serviceRequestRepository.js";
import { prisma } from "../config/prisma.js";

export class ServiceRequestService {
  list(userId: string, role: "CLIENT" | "PROFESSIONAL") {
    return serviceRequestRepository.listForUser(userId, role);
  }

  async create(clientId: string, input: { professionalId: string; kind: "QUOTE" | "SERVICE"; description: string; desiredDate?: Date; attachmentUrl?: string }) {
    const profile = await professionalRepository.findById(input.professionalId);
    if (!profile || !profile.available || profile.user.status !== "ACTIVE") throw new AppError("Profissional indisponível ou não encontrado.", 404);
    const request = await serviceRequestRepository.create({ ...input, clientId });
    await prisma.auditEvent.create({ data: { actorId: clientId, subjectUserId: profile.user.id, action: "SERVICE_REQUEST_CREATED", details: `Solicitação ${request.id}` } });
    return request;
  }

  async update(id: string, userId: string, role: string, input: { status: "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED"; quotedPrice?: number }) {
    const request = await serviceRequestRepository.findById(id);
    if (!request) throw new AppError("Solicitação não encontrada.", 404);
    const isProfessional = request.professional.user.id === userId;
    const isClient = request.clientId === userId;
    if (role !== "ADMIN" && !isProfessional && !isClient) throw new AppError("Você não tem acesso a esta solicitação.", 403);
    const professionalTransitions = ["ACCEPTED", "REJECTED", "COMPLETED"];
    const clientTransitions = ["CANCELLED"];
    if (role !== "ADMIN" && !((isProfessional && professionalTransitions.includes(input.status)) || (isClient && clientTransitions.includes(input.status)))) {
      throw new AppError("Ação não permitida para este usuário.", 403);
    }
    const allowedTransition = request.status === "PENDING"
      ? input.status === "ACCEPTED" || input.status === "REJECTED" || input.status === "CANCELLED"
      : request.status === "ACCEPTED" && input.status === "COMPLETED";
    if (!allowedTransition && role !== "ADMIN") throw new AppError("Transição de status inválida para esta solicitação.", 409);
    const updatedRequest = await serviceRequestRepository.update(id, input);
    await prisma.auditEvent.create({ data: { actorId: userId, subjectUserId: request.clientId, action: "SERVICE_REQUEST_STATUS_UPDATED", details: `${request.status} -> ${input.status}; solicitação ${id}` } });
    return updatedRequest;
  }
}

export const serviceRequestService = new ServiceRequestService();