// Runs before every test file. Gives the app valid settings without touching a real .env.
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'a'.repeat(48);
process.env.REFRESH_TOKEN_SECRET = 'b'.repeat(48);
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
delete process.env.CORS_ORIGINS;
