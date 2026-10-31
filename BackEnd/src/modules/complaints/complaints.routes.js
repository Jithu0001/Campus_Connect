const router = require('express').Router();
const ctrl = require('./complaints.controller');
const { authenticate, requireRole } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { upload } = require('../../middleware/upload');
const s = require('./complaints.schemas');

const studentOnly = [authenticate, requireRole('student')];
const hodOnly = [authenticate, requireRole('hod')];
const adminOnly = [authenticate, requireRole('admin')];

// ----- student -----
// Order matters: authenticate -> role -> upload (multer fills req.body) -> validate -> controller
router.post('/raise-complaint', studentOnly, upload.array('images', 3), validate({ body: s.raiseComplaintSchema }), ctrl.raise);
router.get('/my-complaints/:pinNo', studentOnly, validate({ params: s.pinParams }), ctrl.listMine);
router.delete('/my-complaints/withdraw-complaint/:id', studentOnly, validate({ params: s.idParams }), ctrl.withdraw);

// ----- HOD -----
router.get('/my-assigned-complaints/:id', hodOnly, validate({ params: s.idParams }), ctrl.listAssigned);
router.put('/modify-complaint/:id', hodOnly, validate({ params: s.idParams, body: s.hodUpdateSchema }), ctrl.hodUpdateStatus);

// ----- admin -----
router.get('/all-complaints', adminOnly, ctrl.listAll);
router.put(
  '/all-complaints/modify-complaint/:id',
  adminOnly,
  validate({ params: s.idParams, body: s.adminModifySchema }),
  ctrl.adminModify
);

module.exports = router;
