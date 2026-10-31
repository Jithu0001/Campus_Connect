const usersService = require('./users.service');

// Keys ("newStudent", "newhod", "newadmin") are kept identical to the old API.
const LABELS = {
  student: { key: 'newStudent', exists: 'Student already Registered!', ok: 'Student added Successfully!' },
  hod: { key: 'newhod', exists: 'hod already Registered!', ok: 'Hod added Successfully!' },
  admin: { key: 'newadmin', exists: 'Admin already Registered!', ok: 'Admin added Successfully!' },
};

const makeRegister = (role) => async (req, res) => {
  const { key, exists, ok } = LABELS[role];
  const result = await usersService.register(role, req.body);
  if (result.alreadyRegistered) return res.json({ success: false, message: exists });
  return res.json({ [key]: result.user, message: ok, success: true }); // user.toJSON() hides secrets
};

const makeList = (role, key) => async (req, res) => {
  res.json({ [key]: await usersService.list(role) });
};

module.exports = {
  registerStudent: makeRegister('student'),
  registerHod: makeRegister('hod'),
  registerAdmin: makeRegister('admin'),
  listStudents: makeList('student', 'students'),
  listHods: makeList('hod', 'hods'),
  listAdmins: makeList('admin', 'admins'),
};
