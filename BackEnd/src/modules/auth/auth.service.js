const bcrypt = require('bcrypt');
const { studentModel, hodModel, adminModel } = require('../../models/user.model');
const { HttpError } = require('../../utils/httpError');
const { issueTokens, verifyRefreshToken, hashToken } = require('./tokens');

const MODELS = { student: studentModel, hod: hodModel, admin: adminModel };

// Used so a login for an unknown email takes about as long as a wrong password,
// which stops attackers from discovering which emails are registered by timing.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

// Returns { user, accessToken, refreshToken } or null for bad credentials.
async function login(role, { email, password }) {
  const Model = MODELS[role];
  const user = await Model.findOne({ email }).select('+password');
  const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !ok) return null;

  const { accessToken, refreshToken, refreshTokenHash } = issueTokens(role, user);
  // updateOne (not save): changes only this field and skips re-validating the whole document.
  await Model.updateOne({ _id: user._id }, { $set: { refreshToken: refreshTokenHash } });
  return { user, accessToken, refreshToken };
}

// Rotating refresh: each refresh token works exactly once. Reusing an old one fails.
async function refresh(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(403, 'Invalid refresh token');
  }
  const Model = MODELS[payload.role];
  if (!Model) throw new HttpError(403, 'Invalid token role');

  const currentHash = hashToken(refreshToken);
  const user = await Model.findOne({ refreshToken: currentHash });
  if (!user) throw new HttpError(403, 'Refresh token not recognised');

  const tokens = issueTokens(payload.role, user);
  // Atomic: only succeeds if the stored hash is STILL the one that was presented,
  // so two simultaneous refreshes with the same token can't both win.
  const result = await Model.updateOne(
    { _id: user._id, refreshToken: currentHash },
    { $set: { refreshToken: tokens.refreshTokenHash } }
  );
  if (result.modifiedCount !== 1) throw new HttpError(403, 'Refresh token not recognised');
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

async function logout(refreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(403, 'Invalid refresh token');
  }
  const Model = MODELS[payload.role];
  if (Model) {
    await Model.updateOne({ refreshToken: hashToken(refreshToken) }, { $set: { refreshToken: null } });
  }
}

module.exports = { login, refresh, logout };
