import { Router } from "express";
import { createMessage, listMessages, markMessageRead } from "../controllers/messageController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
router.use(authenticate);
router.get("/", asyncHandler(listMessages));
router.post("/", asyncHandler(createMessage));
router.patch("/:id/read", asyncHandler(markMessageRead));
export default router;