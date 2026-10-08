import { Router } from "express";
import { getMe, updateMe } from "../controllers/userController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
router.use(authenticate);
router.get("/me", asyncHandler(getMe));
router.patch("/me", asyncHandler(updateMe));
export default router;