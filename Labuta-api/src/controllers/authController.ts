import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../dtos/schemas.js";
import { authService } from "../services/authService.js";

export const register = async (req: Request, res: Response) => res.status(201).json(await authService.register(registerSchema.parse(req.body)));
export const login = async (req: Request, res: Response) => res.json(await authService.login(loginSchema.parse(req.body)));
export const logout = async (req: Request, res: Response) => {
  await authService.logout(req.auth!.userId);
  res.status(204).send();
};