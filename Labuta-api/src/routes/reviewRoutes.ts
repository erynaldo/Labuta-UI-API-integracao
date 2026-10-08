import { Router } from "express";
import { createReview } from "../controllers/reviewController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate, authorize } from "../middlewares/authenticate.js";
import { UserRole } from "../generated/prisma/client.js";

const router = Router();
router.post("/", authenticate, authorize(UserRole.CLIENT), asyncHandler(createReview));
export default router;