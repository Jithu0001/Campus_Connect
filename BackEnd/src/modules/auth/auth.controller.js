const authService = require('./auth.service');

// Response shapes match the old API (same keys), minus anything secret.
// user.toJSON() strips password / refreshToken.
const loginResponse = {
  student: (user, t) => ({
    success: true,
    message: 'Login Successful!',
    token: t.accessToken,
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    studentPinNo: user.pinNo,
    studentName: user.name,
  }),
  hod: (user, t) => ({
    hod: user.toJSON(),
    hodName: user.name,
    token: t.accessToken,
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    message: 'Login Successfull!',
    success: true,
  }),
  admin: (user, t) => ({
    admin: user.toJSON(),
    token: t.accessToken,
    accessToken: t.accessToken,
    refreshToken: t.refreshToken,
    message: 'Login Successfull!',
    success: true,
  }),
};

const makeLogin = (role) => async (req, res) => {
  const result = await authService.login(role, req.body);
  // Same message whether the email or the password was wrong (no user enumeration).
  // Kept as HTTP 200 + success:false so existing frontend login screens keep working.
  if (!result) return res.json({ success: false, message: 'Invalid credentials' });
  return res.json(loginResponse[role](result.user, result));
};

const refresh = async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json({ success: true, token: tokens.accessToken, ...tokens });
};

const logout = async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  loginStudent: makeLogin('student'),
  loginHod: makeLogin('hod'),
  loginAdmin: makeLogin('admin'),
  refresh,
  logout,
};
