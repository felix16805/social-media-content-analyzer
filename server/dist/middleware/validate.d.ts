/**
 * validate.ts
 * Generic zod validation middleware factory for Express.
 */
import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
/**
 * Returns an Express middleware that validates `req.body` against the given zod schema.
 * On success, replaces `req.body` with the parsed (and potentially transformed) result.
 * On failure, returns a 400 VALIDATION_ERROR response.
 */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map