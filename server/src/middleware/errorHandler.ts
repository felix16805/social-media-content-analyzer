/**
 * errorHandler.ts
 * Centralized Express error-handling middleware.
 * Returns a consistent { error, code } JSON shape.
 */

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError {
  error: string;
  code: string;
}

/**
 * Catches all errors thrown or passed via next() and returns a uniform JSON response.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = (err as any).errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; ");
    res.status(400).json({ error: message, code: "VALIDATION_ERROR" } satisfies ApiError);
    return;
  }

  // Standard Error objects
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    res.status(status).json({
      error: err.message || "Internal server error",
      code: status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR",
    } satisfies ApiError);
    return;
  }

  // Fallback
  res.status(500).json({ error: "Unknown error", code: "INTERNAL_ERROR" } satisfies ApiError);
}
