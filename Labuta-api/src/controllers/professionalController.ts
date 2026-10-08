import type { Request, Response } from "express";
import { professionalProfileSchema } from "../dtos/schemas.js";
import { professionalService } from "../services/professionalService.js";
import { reviewService } from "../services/reviewService.js";

export const listProfessionals = async (req: Request, res: Response) => {
  const available = req.query.available === undefined ? undefined : req.query.available === "true";
  res.json(await professionalService.list({ city: req.query.city as string, profession: req.query.profession as string, q: req.query.q as string, available }));
};
export const getProfessional = async (req: Request, res: Response) => res.json(await professionalService.getById(req.params.id));
export const saveMyProfile = async (req: Request, res: Response) => res.status(200).json(await professionalService.saveProfile(req.auth!.userId, professionalProfileSchema.parse(req.body)));
export const listReviews = async (req: Request, res: Response) => res.json(await reviewService.list(req.params.id));