const router = require('express').Router();
const ctrl = require('./departments.controller');
const { authenticate, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const s = require('./departments.schemas');

const adminOnly = [authenticate, requireRole('admin')];

// This path used to be defined TWICE (an admin version and a student version). Because the
// old admin check let everyone through, the admin copy answered students too. With real role
// checks that would have locked students out, so it is now ONE route open to all three roles.
router.get('/all-departments', authenticate, requireRole('student', 'hod', 'admin'), ctrl.list);

router.post('/add-department', adminOnly, validate({ body: s.addDepartmentSchema }), ctrl.add);
router.put(
  '/all-departments/modify-department/:id',
  adminOnly,
  validate({ params: s.idParams, body: s.modifyDepartmentSchema }),
  ctrl.modify
);
router.delete(
  '/all-departments/delete-department/:id',
  adminOnly,
  validate({ params: s.idParams }),
  ctrl.remove
);

module.exports = router;
