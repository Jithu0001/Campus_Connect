const { z } = require('zod');

// Both fields must be plain strings. This alone blocks NoSQL-injection logins such as
// { "email": { "$gt": "" } } because an object is not a string.
const loginSchema = z.object({
  email: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(2048),
});

module.exports = { loginSchema, refreshSchema };
