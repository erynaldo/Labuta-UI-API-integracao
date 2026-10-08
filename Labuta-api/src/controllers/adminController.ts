import type { Request, Response } from "express";
import { accountStatusSchema, auditFlagSchema } from "../dtos/schemas.js";
import { adminService } from "../services/adminService.js";

const pagination = (req: Request) => ({ page: Math.max(1, Number(req.query.page) || 1), limit: Math.min(100, Math.max(1, Number(req.query.limit) || 20)) });
export const dashboard = async (_req: Request, res: Response) => res.json(await adminService.dashboard());
export const listUsers = async (req: Request, res: Response) => res.json(await adminService.users(pagination(req).page, pagination(req).limit));
export const listRequests = async (req: Request, res: Response) => res.json(await adminService.requests(pagination(req).page, pagination(req).limit));
export const listAudit = async (req: Request, res: Response) => res.json(await adminService.audit(pagination(req).page, pagination(req).limit));
export const updateUserStatus = async (req: Request, res: Response) => res.json(await adminService.setUserStatus(req.params.id, accountStatusSchema.parse(req.body).status, req.auth!.userId));
export const resolveAudit = async (req: Request, res: Response) => res.json(await adminService.resolveAudit(req.params.id, req.auth!.userId));
export const flagAudit = async (req: Request, res: Response) => res.json(await adminService.flagAudit(req.params.id, auditFlagSchema.parse(req.body).flagged, req.auth!.userId));