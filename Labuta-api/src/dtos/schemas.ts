import { z } from "zod";

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const phone = z.string().trim().min(8).max(20);

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email,
  phone,
  city: z.string().trim().min(2).max(100),
  password: z.string().min(6).max(72),
});

export const loginSchema = z.object({ email, password: z.string().min(1).max(72) });

export const updateUserSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  email: email.optional(),
  phone: phone.optional(),
  city: z.string().trim().min(2).max(100).optional(),
  cpf: z.string().regex(/^\d{11}$/, "O CPF deve conter 11 números.").optional(),
  role: z.enum(["CLIENT", "PROFESSIONAL"]).optional(),
  available: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar.");

export const professionalProfileSchema = z.object({
  profession: z.string().trim().min(2).max(100),
  bio: z.string().trim().min(10).max(2000),
  experienceYears: z.number().int().min(0).max(80),
  available: z.boolean().optional(),
  documentType: z.enum(["CPF", "CNPJ"]).optional(),
  documentNumber: z.string().trim().min(11).max(20).optional(),
  services: z.array(z.string().trim().min(2).max(100)).max(30).optional(),
  portfolio: z.array(z.object({ title: z.string().trim().min(1).max(160), imageUrl: z.string().url().max(2048) })).max(50).optional(),
});

export const serviceRequestSchema = z.object({
  professionalId: z.string().uuid(),
  kind: z.enum(["QUOTE", "SERVICE"]),
  description: z.string().trim().min(10).max(3000),
  desiredDate: z.coerce.date().optional(),
  attachmentUrl: z.string().url().max(2048).optional(),
});

export const updateRequestSchema = z.object({
  status: z.enum(["ACCEPTED", "COMPLETED", "REJECTED", "CANCELLED"]),
  quotedPrice: z.number().nonnegative().max(99999999).optional(),
});

export const messageSchema = z.object({
  receiverId: z.string().uuid(),
  requestId: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(4000),
});

export const reviewSchema = z.object({
  requestId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(2000),
});

export const accountStatusSchema = z.object({ status: z.enum(["ACTIVE", "SUSPENDED"]) });
export const auditResolutionSchema = z.object({ resolved: z.boolean() });
export const auditFlagSchema = z.object({ flagged: z.boolean() });