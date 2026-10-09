import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./exception/errorHandler.js";
import { asyncHandler } from "./exception/asyncHandler.js";
import { prisma } from "./config/prisma.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import professionalRoutes from "./routes/professionalRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

export const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/status", asyncHandler(async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
}));

app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

const api = express.Router();
api.use("/auth", authRoutes);
api.use("/users", userRoutes);
api.use("/professionals", professionalRoutes);
api.use("/requests", requestRoutes);
api.use("/messages", messageRoutes);
api.use("/reviews", reviewRoutes);
api.use("/admin", adminRoutes);
app.use("/api", api);
// app.use("/", (_req, res) => res.status(200).json({ message: "aplicação rodando" }));

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(errorHandler);