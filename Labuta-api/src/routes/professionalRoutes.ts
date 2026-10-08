import { Router } from "express";
import { getProfessional, listProfessionals, listReviews, saveMyProfile } from "../controllers/professionalController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
router.get("/", asyncHandler(listProfessionals));
router.put("/me", authenticate, asyncHandler(saveMyProfile));
router.get("/:id/reviews", asyncHandler(listReviews));
router.get("/:id", asyncHandler(getProfessional));
export default router;