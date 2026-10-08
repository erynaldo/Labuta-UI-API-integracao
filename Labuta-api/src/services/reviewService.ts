import { AppError } from "../exception/AppError.js";
import { reviewRepository } from "../repositories/reviewRepository.js";
import { serviceRequestRepository } from "../repositories/serviceRequestRepository.js";
import { prisma } from "../config/prisma.js";

export class ReviewService {
  async create(authorId: string, input: { requestId: string; rating: number; comment: string }) {
    const request = await serviceRequestRepository.findById(input.requestId);
    if (!request) throw new AppError("Solicitação não encontrada.", 404);
    if (request.clientId !== authorId) throw new AppError("Somente o contratante pode avaliar este serviço.", 403);
    if (request.status !== "COMPLETED") throw new AppError("Só é possível avaliar uma solicitação concluída.", 409);
    const review = await reviewRepository.create({ ...input, authorId, professionalId: request.professionalId });
    await prisma.auditEvent.create({ data: { actorId: authorId, subjectUserId: request.professional.user.id, action: "REVIEW_CREATED", details: `Solicitação ${request.id}; nota ${input.rating}` } });
    return review;
  }

  list(professionalId: string) { return reviewRepository.listForProfessional(professionalId); }
}

export const reviewService = new ReviewService();