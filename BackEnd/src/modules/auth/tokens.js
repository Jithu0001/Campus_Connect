const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

// Same lifetimes the old code used per role.
const ACCESS_TTL = { student: '15m', hod: '1h', admin: '1h' };
const REFRESH_TTL = '7d';

// The token carries only what the routes need. Role always comes from the collection
// the user was found in, never from user-supplied data.
function buildPayload(role, user) {
  switch (role) {
    case 'student':
      return { role, studentId: String(user._id), studentPinNo: user.pinNo };
    case 'hod':
      return { role, hodId: String(user._id) };
    case 'admin':
      return { role, adminId: String(user._id) };
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

// Refresh tokens are stored hashed (SHA-256) so a database leak can't be replayed.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

function issueTokens(role, user) {
  const payload = buildPayload(role, user);
  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TTL[role],
  });
  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: REFRESH_TTL,
    jwtid: crypto.randomUUID(), // makes every refresh token unique
  });
  return { accessToken, refreshToken, refreshTokenHash: hashToken(refreshToken) };
}

const verifyRefreshToken = (token) =>
  jwt.verify(token, env.REFRESH_TOKEN_SECRET, { algorithms: ['HS256'] });

module.exports = { issueTokens, verifyRefreshToken, hashToken };
