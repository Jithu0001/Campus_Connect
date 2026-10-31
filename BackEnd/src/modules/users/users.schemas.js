const { z } = require('zod');

// z.object() DROPS fields that are not listed. That is what stops "mass assignment":
// a caller can no longer sneak in role, refreshToken, _id, etc.
const email = z.string().trim().email().max(254);
const password = z.string().min(8, 'must be at least 8 characters').max(72);
const name = z.string().trim().min(3).max(100);

const registerStudentSchema = z.object({
  name,
  pinNo: z.string().trim().min(10).max(30),
  email,
  password,
  branch: z.string().trim().min(3).max(100),
  yearOfStudy: z.coerce.number().int().min(1).max(6),
});

const registerHodSchema = z.object({
  name,
  hodId: z.string().trim().min(1).max(30),
  email,
  password,
  branch: z.string().trim().min(3).max(100),
});

const registerAdminSchema = z.object({
  name,
  adminId: z.string().trim().min(1).max(30),
  email,
  password,
});

module.exports = { registerStudentSchema, registerHodSchema, registerAdminSchema };
