const { z } = require('zod');
const { HttpError } = require('./errors');
const email = z.string().trim().email().max(254).transform((v) => v.toLowerCase());
const password = z.string().min(8).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72);
const schemas = {
  register: z.object({ email, password }).strict(),
  login: z.object({ email, password: z.string().min(1).max(72).refine((value) => Buffer.byteLength(value, 'utf8') <= 72) }).strict(),
  movieQuery: z.object({ order: z.enum(['timeline', 'release']).default('timeline'), search: z.string().trim().max(100).default('') }).strict(),
  entryCreate: z.object({ movieId: z.coerce.number().int().positive(), status: z.enum(['planned', 'watching', 'watched']).default('planned'), note: z.string().trim().max(1000).optional() }).strict(),
  entryUpdate: z.object({ status: z.enum(['planned', 'watching', 'watched']).optional(), note: z.string().trim().max(1000).nullable().optional() }).strict().refine((v) => Object.keys(v).length > 0)
};
function validate(schema) { return (req, res, next) => { const result = schema.safeParse(req.body); if (!result.success) return next(new HttpError(400, 'VALIDATION_ERROR', 'Request validation failed.', result.error.flatten())); req.validated = result.data; next(); }; }
function validateQuery(schema) { return (req, res, next) => { const result = schema.safeParse(req.query); if (!result.success) return next(new HttpError(400, 'VALIDATION_ERROR', 'Request validation failed.', result.error.flatten())); req.validated = result.data; next(); }; }
module.exports = { schemas, validate, validateQuery };
