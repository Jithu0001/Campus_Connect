const router = require('express').Router();
const ctrl = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { loginLimiter } = require('../../middleware/rateLimiters');
const { loginSchema, refreshSchema } = require('./auth.schemas');

// Same URLs as before. (They used to live in student/hod/admin route files.)
router.post('/login-student', loginLimiter, validate({ body: loginSchema }), ctrl.loginStudent);
router.post('/login-hod', loginLimiter, validate({ body: loginSchema }), ctrl.loginHod);
router.post('/login-admin', loginLimiter, validate({ body: loginSchema }), ctrl.loginAdmin);
router.post('/refresh-token', validate({ body: refreshSchema }), ctrl.refresh);
router.post('/logout', validate({ body: refreshSchema }), ctrl.logout);

module.exports = router;
