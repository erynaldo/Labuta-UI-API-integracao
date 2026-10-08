import type { Request, Response } from "express";
import { reviewSchema } from "../dtos/schemas.js";
import { reviewService } from "../services/reviewService.js";

export const createReview = async (req: Request, res: Response) => res.status(201).json(await reviewService.create(req.auth!.userId, reviewSchema.parse(req.body)));