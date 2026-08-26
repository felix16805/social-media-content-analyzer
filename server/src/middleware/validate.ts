/**
 * validate.ts
 * Generic zod validation middleware factory for Express.
 */

import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Returns an Express middleware that validates `req.body` against the given zod schema.
 * On success, replaces `req.body` with the parsed (and potentially transformed) result.
 * On failure, returns a 400 VALIDATION_ERROR response.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          issues: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}
