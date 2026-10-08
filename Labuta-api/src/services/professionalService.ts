import { AppError } from "../exception/AppError.js";
import { professionalRepository } from "../repositories/professionalRepository.js";
import { prisma } from "../config/prisma.js";

export class ProfessionalService {
  list(filters: { city?: string; profession?: string; q?: string; available?: boolean }) {
    return professionalRepository.list(filters);
  }

  async getById(id: string) {
    const profile = await professionalRepository.findById(id);
    if (!profile || profile.user.status !== "ACTIVE") throw new AppError("Profissional não encontrado.", 404);
    return profile;
  }

  async saveProfile(userId: string, input: Parameters<typeof professionalRepository.save>[1]) {
    const profile = await professionalRepository.save(userId, input);
    await prisma.auditEvent.create({ data: { actorId: userId, subjectUserId: userId, action: "PROFESSIONAL_PROFILE_SAVED", details: profile.profession.name } });
    return profile;
  }
}

export const professionalService = new ProfessionalService();