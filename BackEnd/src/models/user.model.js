const mongoose = require('mongoose');

// SECURITY: password and refreshToken are never loaded unless a query explicitly asks
// for them (select: false), and are removed again if a document is ever turned into JSON.
// Two layers, so one forgotten .select() can't leak a hash to the browser.
const hideSecrets = (doc, ret) => {
  delete ret.password;
  delete ret.refreshToken;
  delete ret.__v;
  return ret;
};
const options = {
  timestamps: true,
  toJSON: { transform: hideSecrets },
  toObject: { transform: hideSecrets },
};

const secretFields = {
  // Stored as a bcrypt hash. There is intentionally NO default value here.
  password: { type: String, required: true, select: false },
  // Stored as a SHA-256 hash of the refresh token (see auth/tokens.js).
  refreshToken: { type: String, default: null, select: false },
};

// NOTE: model names ('Students', 'Hod', 'Admins') are unchanged so your existing
// MongoDB collections and data keep working.
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
    pinNo: { type: String, required: true, minlength: 10, unique: true },
    email: { type: String, required: true, unique: true },
    ...secretFields,
    branch: { type: String, required: true, minlength: 3 },
    yearOfStudy: { type: Number, required: true },
    role: { type: String, default: 'student', immutable: true },
  },
  options
);

const hodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
    hodId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    ...secretFields,
    branch: { type: String, required: true, minlength: 3 },
    role: { type: String, default: 'hod', immutable: true },
  },
  options
);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minlength: 3 },
    adminId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    ...secretFields,
    role: { type: String, default: 'admin', immutable: true },
  },
  options
);

const studentModel = mongoose.model('Students', studentSchema);
const hodModel = mongoose.model('Hod', hodSchema);
const adminModel = mongoose.model('Admins', adminSchema);

module.exports = { studentModel, hodModel, adminModel };
