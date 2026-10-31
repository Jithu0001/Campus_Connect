const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { HttpError } = require('../utils/httpError');

function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  return scheme && scheme.toLowerCase() === 'bearer' && token ? token : null;
}

// AUTHENTICATION: "who are you?"  -> proves the token is genuine and not expired.
// Sets req.user = { role, id, ...rest of the token payload }.
function authenticate(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) return next(new HttpError(401, 'Unauthorized!!'));
  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET, { algorithms: ['HS256'] });
    req.user = { ...payload, id: payload.studentId || payload.hodId || payload.adminId || null };
    return next();
  } catch (err) {
    return next(
      new HttpError(401, 'Invalid User! Please Login again...', { errmsg: 'Invalid Token' })
    );
  }
}

// AUTHORIZATION: "are you allowed to do this?"  -> checks the role from the verified token.
// Usage: router.get('/x', authenticate, requireRole('admin'), handler)
//        requireRole('hod', 'admin') allows either role.
function requireRole(...allowedRoles) {
  if (allowedRoles.length === 0) throw new Error('requireRole() needs at least one role');
  return (req, res, next) => {
    if (!req.user) return next(new HttpError(401, 'Unauthorized!!'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new HttpError(403, 'Forbidden: you do not have access to this resource'));
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
