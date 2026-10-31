const router = require('express').Router();
const ctrl = require('./users.controller');
const { authenticate, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const s = require('./users.schemas');

// Every route in this file is admin-only.
const adminOnly = [authenticate, requireRole('admin')];

router.post('/register-admin', adminOnly, validate({ body: s.registerAdminSchema }), ctrl.registerAdmin);
router.post('/register-student', adminOnly, validate({ body: s.registerStudentSchema }), ctrl.registerStudent);
router.post('/register-hod', adminOnly, validate({ body: s.registerHodSchema }), ctrl.registerHod);

router.get('/students', adminOnly, ctrl.listStudents);
router.get('/hods', adminOnly, ctrl.listHods);
router.get('/admins', adminOnly, ctrl.listAdmins);

module.exports = router;
