import type { Request, Response } from "express";
import { updateUserSchema } from "../dtos/schemas.js";
import { userService } from "../services/userService.js";

export const getMe = async (req: Request, res: Response) => res.json(await userService.getById(req.auth!.userId));
export const updateMe = async (req: Request, res: Response) => res.json(await userService.update(req.auth!.userId, updateUserSchema.parse(req.body)));