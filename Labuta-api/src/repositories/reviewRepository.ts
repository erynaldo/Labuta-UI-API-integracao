import { prisma } from "../config/prisma.js";

export class ReviewRepository {
  listForProfessional(professionalId: string) {
    return prisma.review.findMany({ where: { professionalId }, include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } });
  }

  create(data: { requestId: string; authorId: string; professionalId: string; rating: number; comment: string }) {
    return prisma.review.create({ data, include: { author: { select: { id: true, name: true } } } });
  }
}

export const reviewRepository = new ReviewRepository();