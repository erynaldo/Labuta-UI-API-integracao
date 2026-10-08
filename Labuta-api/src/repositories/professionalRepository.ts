import { prisma } from "../config/prisma.js";

const profileInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, city: true, status: true } },
  profession: true,
  services: true,
  portfolio: true,
  reviews: { select: { rating: true } },
} as const;

export class ProfessionalRepository {
  list(filters: { city?: string; profession?: string; q?: string; available?: boolean }) {
    return prisma.professionalProfile.findMany({
      where: {
        available: filters.available,
        user: { status: "ACTIVE", ...(filters.city && { city: { contains: filters.city, mode: "insensitive" as const } }) },
        ...(filters.profession && { profession: { name: { contains: filters.profession, mode: "insensitive" as const } } }),
        ...(filters.q && { OR: [
          { bio: { contains: filters.q, mode: "insensitive" } },
          { profession: { name: { contains: filters.q, mode: "insensitive" } } },
          { user: { name: { contains: filters.q, mode: "insensitive" } } },
          { services: { some: { name: { contains: filters.q, mode: "insensitive" } } } },
        ] }),
      },
      include: profileInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.professionalProfile.findUnique({ where: { id }, include: profileInclude });
  }

  findByUserId(userId: string) {
    return prisma.professionalProfile.findUnique({ where: { userId } });
  }

  async save(userId: string, data: {
    profession: string; bio: string; experienceYears: number; available?: boolean;
    documentType?: "CPF" | "CNPJ"; documentNumber?: string;
    services?: string[]; portfolio?: { title: string; imageUrl: string }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const profession = await tx.profession.upsert({ where: { name: data.profession }, create: { name: data.profession }, update: {} });
      const profile = await tx.professionalProfile.upsert({
        where: { userId },
        create: { userId, professionId: profession.id, bio: data.bio, experienceYears: data.experienceYears, available: data.available ?? true, documentType: data.documentType, documentNumber: data.documentNumber },
        update: { professionId: profession.id, bio: data.bio, experienceYears: data.experienceYears, available: data.available, documentType: data.documentType, documentNumber: data.documentNumber },
      });
      if (data.services) {
        await tx.professionalService.deleteMany({ where: { profileId: profile.id } });
        if (data.services.length) await tx.professionalService.createMany({ data: [...new Set(data.services)].map((name) => ({ profileId: profile.id, name })) });
      }
      if (data.portfolio) {
        await tx.portfolioItem.deleteMany({ where: { profileId: profile.id } });
        if (data.portfolio.length) await tx.portfolioItem.createMany({ data: data.portfolio.map((item) => ({ ...item, profileId: profile.id })) });
      }
      await tx.user.update({ where: { id: userId }, data: { role: "PROFESSIONAL" } });
      return tx.professionalProfile.findUniqueOrThrow({ where: { id: profile.id }, include: profileInclude });
    });
  }
}

export const professionalRepository = new ProfessionalRepository();