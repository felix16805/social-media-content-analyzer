"use strict";
/**
 * validate.ts
 * Generic zod validation middleware factory for Express.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
/**
 * Returns an Express middleware that validates `req.body` against the given zod schema.
 * On success, replaces `req.body` with the parsed (and potentially transformed) result.
 * On failure, passes the ZodError to the error handler.
 */
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(result.error);
            return;
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map