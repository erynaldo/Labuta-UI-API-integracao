import type { Request, Response } from "express";
import { messageSchema } from "../dtos/schemas.js";
import { messageService } from "../services/messageService.js";

export const listMessages = async (req: Request, res: Response) => res.json(await messageService.list(req.auth!.userId));
export const createMessage = async (req: Request, res: Response) => res.status(201).json(await messageService.create(req.auth!.userId, messageSchema.parse(req.body)));
export const markMessageRead = async (req: Request, res: Response) => { await messageService.markRead(req.params.id, req.auth!.userId); res.status(204).send(); };