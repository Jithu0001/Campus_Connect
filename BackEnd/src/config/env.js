// Loads .env and validates it ONCE at startup. Every other file imports this
// object instead of touching process.env, so a missing/weak setting fails fast
// with a clear message instead of causing a confusing bug later.
require('dotenv').config({ quiet: true });
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  MONGO_URI: z.string().min(1).default('mongodb://localhost:27017/Campus_Connect'),
  ACCESS_TOKEN_SECRET: z.string().min(1, 'is required'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'is required'),
  CORS_ORIGINS: z.string().optional(),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  EMAIL_FROM: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  BREVO_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  throw new Error(`Invalid environment configuration:\n${lines.join('\n')}\nSee .env.example`);
}
const env = parsed.data;
const isProd = env.NODE_ENV === 'production';

if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different values.');
}

const weak = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'].filter((k) => env[k].length < 32);
if (weak.length) {
  const msg = `${weak.join(' and ')} should be at least 32 characters. Generate one with: ` +
    `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`;
  if (isProd) throw new Error(msg);
  console.warn(`[config] WARNING: ${msg}`);
}

const corsOrigins = (env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (isProd && corsOrigins.length === 0) {
  throw new Error('CORS_ORIGINS is required in production (comma-separated frontend URLs).');
}

const brevo = env['BREVO_API_KEY'].length > 0;
if(!brevo){
  const msg = "create an account in brevo and generate an api key"
  if (isProd) throw new Error(msg);
  console.warn(`[config] WARNING: ${msg}`);
}   
 
const cloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((k) => env[k].length <= 0);
if(cloudinary.length){ 
  const msg = "create an account in cloudinary and generate an api key and api secret"
  if (isProd) throw new Error(msg);
  console.warn(`[config] WARNING: ${msg}`);
}
module.exports = Object.freeze({ ...env, isProd, corsOrigins });
