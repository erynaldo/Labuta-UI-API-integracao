import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { login, logout, register } from "../controllers/authController.js";
import { asyncHandler } from "../exception/asyncHandler.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

/** @openapi
 * /auth/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Cria uma conta de contratante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, city, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               city: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: Conta criada e token de acesso emitido }
 *       409: { description: E-mail já cadastrado }
 */
router.post("/register", authLimiter, asyncHandler(register));

/** @openapi
 * /auth/login:
 *   post:
 *     tags: [Autenticação]
 *     summary: Autentica usuário ou administrador
 *     responses:
 *       200: { description: Sessão autenticada }
 *       401: { description: Credenciais inválidas }
 */
router.post("/login", authLimiter, asyncHandler(login));
router.post("/logout", authenticate, asyncHandler(logout));
export default router;