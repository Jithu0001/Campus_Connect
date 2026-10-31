const jwt = require('jsonwebtoken');

const ID = {
  student: '64b000000000000000000001',
  hod: '64b0000000000000000000a1',
  otherHod: '64b0000000000000000000a2',
  admin: '64b0000000000000000000b1',
  complaint: '64b0000000000000000000c1',
};
const PIN = 'PIN0000000001';
const OTHER_PIN = 'PIN0000000002';

const sign = (payload, secret = process.env.ACCESS_TOKEN_SECRET, opts = {}) =>
  jwt.sign(payload, secret, { expiresIn: '15m', ...opts });

const token = {
  student: () => sign({ role: 'student', studentId: ID.student, studentPinNo: PIN }),
  hod: () => sign({ role: 'hod', hodId: ID.hod }),
  admin: () => sign({ role: 'admin', adminId: ID.admin }),
};
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

// Mongoose queries are chainable; these fake the chains the services use.
const leanOf = (value) => ({ lean: async () => value });

module.exports = { ID, PIN, OTHER_PIN, sign, token, bearer, leanOf };
