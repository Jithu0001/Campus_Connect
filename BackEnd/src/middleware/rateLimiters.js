const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const handler = (req, res) =>
  res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });

const base = { windowMs: 15 * 60 * 1000, standardHeaders: 'draft-7', legacyHeaders: false, handler };

// Generous cap for the whole API (many students may share one college Wi-Fi IP).
const apiLimiter = rateLimit({ ...base, limit: 600 });

// Strict cap on login attempts, counted per (IP + email) so one student's typos
// can't lock out everyone on the same network.
const loginLimiter = rateLimit({
  ...base,
  limit: 10,
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip)}|${String(req.body?.email ?? '').toLowerCase().slice(0, 254)}`,
});

module.exports = { apiLimiter, loginLimiter };
