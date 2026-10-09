import { STATUS_CODES } from "node:http";
import type { RequestHandler } from "express";

export const httpLogger: RequestHandler = (req, res, next) => {
  res.on("finish", () => {
    const statusText = STATUS_CODES[res.statusCode]?.toUpperCase() ?? "UNKNOWN STATUS";
    console.info(`[HTTP] ${req.method} ${req.path} - ${res.statusCode} ${statusText}`);
  });

  next();
};
