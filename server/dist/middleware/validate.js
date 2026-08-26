"use strict";
/**
 * validate.ts
 * Generic zod validation middleware factory for Express.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
/**
 * Returns an Express middleware that validates `req.body` against the given zod schema.
 * On success, replaces `req.body` with the parsed (and potentially transformed) result.
 * On failure, returns a 400 VALIDATION_ERROR response.
 */
function validate(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
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
//# sourceMappingURL=validate.js.map