const { ZodError } = require('zod');
const { HttpError } = require('../utils/httpError');

// validate({ body: schema, params: schema })
// - body is REPLACED with the parsed result, so unknown fields (e.g. "role") are dropped.
// - params are only checked (e.g. that :id looks like a Mongo ObjectId).
function validate({ body, params } = {}) {
  return (req, res, next) => {
    try {
      if (params) params.parse(req.params);
      if (body) req.body = body.parse(req.body ?? {});
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
        const first = errors[0];
        const message = first.field ? `${first.field}: ${first.message}` : first.message;
        return next(new HttpError(400, message, { errors }));
      }
      return next(err);
    }
  };
}
module.exports = { validate };
