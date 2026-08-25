/**
 * errorHandler.ts
 * Centralized Express error-handling middleware.
 * Returns a consistent { error, code } JSON shape.
 */
import type { Request, Response, NextFunction } from "express";
export interface ApiError {
    error: string;
    code: string;
}
/**
 * Catches all errors thrown or passed via next() and returns a uniform JSON response.
 */
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=errorHandler.d.ts.map