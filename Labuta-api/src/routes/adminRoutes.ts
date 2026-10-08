import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import { dashboard, flagAudit, listAudit, listRequests, listUsers, resolveAudit, updateUserStatus } from "../controllers/adminController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate, authorize } from "../middlewares/authenticate.js";

const router = Router();
router.use(authenticate, authorize(UserRole.ADMIN));
router.get("/dashboard", asyncHandler(dashboard));
router.get("/users", asyncHandler(listUsers));
router.patch("/users/:id/status", asyncHandler(updateUserStatus));
router.get("/requests", asyncHandler(listRequests));
router.get("/audit", asyncHandler(listAudit));
router.patch("/audit/:id/flag", asyncHandler(flagAudit));
router.patch("/audit/:id/resolve", asyncHandler(resolveAudit));
export default router;