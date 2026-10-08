import type { Request, Response } from "express";
import { serviceRequestSchema, updateRequestSchema } from "../dtos/schemas.js";
import { serviceRequestService } from "../services/serviceRequestService.js";

export const listRequests = async (req: Request, res: Response) => res.json(await serviceRequestService.list(req.auth!.userId, req.auth!.role as "CLIENT" | "PROFESSIONAL"));
export const createRequest = async (req: Request, res: Response) => res.status(201).json(await serviceRequestService.create(req.auth!.userId, serviceRequestSchema.parse(req.body)));
export const updateRequest = async (req: Request, res: Response) => res.json(await serviceRequestService.update(req.params.id, req.auth!.userId, req.auth!.role, updateRequestSchema.parse(req.body)));