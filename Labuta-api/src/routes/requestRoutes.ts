import { Router } from "express";
import { createRequest, listRequests, updateRequest } from "../controllers/serviceRequestController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate, authorize } from "../middlewares/authenticate.js";
import { UserRole } from "../generated/prisma/client.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(listRequests));
router.post("/", authorize(UserRole.CLIENT, UserRole.PROFESSIONAL), asyncHandler(createRequest));
router.patch("/:id", asyncHandler(updateRequest));
export default router;