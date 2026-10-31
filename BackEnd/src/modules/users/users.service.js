const bcrypt = require('bcrypt');
const { studentModel, hodModel, adminModel } = require('../../models/user.model');

const MODELS = { student: studentModel, hod: hodModel, admin: adminModel };
const BCRYPT_ROUNDS = 10;

// Returns { user } or { alreadyRegistered: true }.
async function register(role, data) {
  const Model = MODELS[role];
  if (await Model.exists({ email: data.email })) return { alreadyRegistered: true };
  const password = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
  const user = await Model.create({ ...data, password });
  return { user };
}

// password / refreshToken are excluded automatically (select: false on the schema).
const list = (role) => MODELS[role].find().lean();

module.exports = { register, list };
