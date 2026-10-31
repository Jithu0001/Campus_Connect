const request = require('supertest');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

jest.mock('../src/modules/notifications/notifications.service', () => ({
  complaintRaised: jest.fn(),
  statusChanged: jest.fn(),
}));

const app = require('../src/app');
const notifications = require('../src/modules/notifications/notifications.service');
const { studentModel: Students, adminModel: Admins } = require('../src/models/user.model');
const Complaints = require('../src/models/complaint.model');
const Departments = require('../src/models/department.model');
const { issueTokens, hashToken } = require('../src/modules/auth/tokens');
const { removeUploadedFile } = require('../src/utils/files');
const { UPLOADS_DIR } = require('../src/config/paths');
const { ID, PIN, OTHER_PIN, sign, token, bearer, leanOf } = require('./helpers');

const uploadedFiles = () => fs.readdirSync(UPLOADS_DIR).filter((f) => f.startsWith('image-'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// 1x1 transparent PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

beforeEach(() => {
  notifications.complaintRaised.mockClear();
  notifications.statusChanged.mockClear();
  uploadedFiles().forEach((f) => fs.unlinkSync(path.join(UPLOADS_DIR, f)));
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => uploadedFiles().forEach((f) => fs.unlinkSync(path.join(UPLOADS_DIR, f))));

// ---------------------------------------------------------------------------
// 1. ROLE-BASED ACCESS CONTROL  (the Phase 0 headline bug)
// ---------------------------------------------------------------------------
describe('role-based access control', () => {
  const id = ID.complaint;
  const routes = [
    // [allowed role, method, url]
    ['admin', 'get', '/api/all-complaints'],
    ['admin', 'get', '/api/students'],
    ['admin', 'get', '/api/hods'],
    ['admin', 'get', '/api/admins'],
    ['admin', 'post', '/api/register-admin'],
    ['admin', 'post', '/api/register-student'],
    ['admin', 'post', '/api/register-hod'],
    ['admin', 'post', '/api/add-department'],
    ['admin', 'put', `/api/all-complaints/modify-complaint/${id}`],
    ['admin', 'put', `/api/all-departments/modify-department/${id}`],
    ['admin', 'delete', `/api/all-departments/delete-department/${id}`],
    ['hod', 'get', `/api/my-assigned-complaints/${ID.hod}`],
    ['hod', 'put', `/api/modify-complaint/${id}`],
    ['student', 'post', '/api/raise-complaint'],
    ['student', 'get', `/api/my-complaints/${PIN}`],
    ['student', 'delete', `/api/my-complaints/withdraw-complaint/${id}`],
    ['any', 'get', '/api/all-departments'],
  ];

  describe.each(routes)('%s-only: %s %s', (allowed, method, url) => {
    const call = (headers = {}) => request(app)[method](url).set(headers).send({});

    test('no token -> 401', async () => expect((await call()).status).toBe(401));
    test('garbage token -> 401', async () => expect((await call(bearer('not.a.jwt'))).status).toBe(401));
    test('expired token -> 401', async () => {
      const expired = sign({ role: 'admin', adminId: ID.admin }, undefined, { expiresIn: -10 });
      expect((await call(bearer(expired))).status).toBe(401);
    });
    test('token signed with the wrong secret -> 401', async () => {
      const forged = sign({ role: 'admin', adminId: ID.admin }, 'x'.repeat(48));
      expect((await call(bearer(forged))).status).toBe(401);
    });
    test('unsigned "alg: none" token -> 401', async () => {
      const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
      const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ role: 'admin', adminId: ID.admin })}.`;
      expect((await call(bearer(none))).status).toBe(401);
    });
    test('a refresh token is not accepted as an access token -> 401', async () => {
      const { refreshToken } = issueTokens('admin', { _id: ID.admin });
      expect((await call(bearer(refreshToken))).status).toBe(401);
    });

    const wrongRoles = ['student', 'hod', 'admin'].filter((r) => allowed !== 'any' && r !== allowed);
    if (wrongRoles.length > 0) {
      test.each(wrongRoles)('%s token -> 403', async (role) => {
        expect((await call(bearer(token[role]()))).status).toBe(403);
      });
    }
  });

  test('every role may list departments', async () => {
    jest.spyOn(Departments, 'find').mockReturnValue(leanOf([{ branchName: 'CSE' }]));
    for (const role of ['student', 'hod', 'admin']) {
      const res = await request(app).get('/api/all-departments').set(bearer(token[role]()));
      expect(res.status).toBe(200);
      expect(res.body.departments).toHaveLength(1);
    }
  });

  test('a student token can no longer create an admin (the original takeover bug)', async () => {
    const spy = jest.spyOn(Admins, 'create');
    const res = await request(app)
      .post('/api/register-admin')
      .set(bearer(token.student()))
      .send({ name: 'Evil Admin', adminId: 'X1', email: 'evil@x.com', password: 'Str0ngPass!' });
    expect(res.status).toBe(403);
    expect(spy).not.toHaveBeenCalled();
  });

  test('admin reaches the handler', async () => {
    jest.spyOn(Complaints, 'find').mockReturnValue(leanOf([]));
    const res = await request(app).get('/api/all-complaints').set(bearer(token.admin()));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ complaints: [] });
  });

  test('the public test-email route is gone', async () => {
    const res = await request(app).post('/api/complaint-email').send({ email: 'victim@x.com' });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// 2. OWNERSHIP CHECKS  (IDOR fixes)
// ---------------------------------------------------------------------------
describe('ownership checks', () => {
  test("student cannot read another student's complaints by changing the pin in the URL", async () => {
    const find = jest.spyOn(Complaints, 'find');
    const res = await request(app).get(`/api/my-complaints/${OTHER_PIN}`).set(bearer(token.student()));
    expect(res.status).toBe(403);
    expect(find).not.toHaveBeenCalled();
  });

  test('student lists only complaints filtered by the PIN from their token', async () => {
    const find = jest.spyOn(Complaints, 'find').mockReturnValue(leanOf([{ _id: 'c1', studentPinNo: PIN, anonymous: false }]));
    const res = await request(app).get(`/api/my-complaints/${PIN}`).set(bearer(token.student()));
    expect(res.status).toBe(200);
    expect(find).toHaveBeenCalledWith({ studentPinNo: PIN });
    expect(res.body.myComplaints[0].studentPinNo).toBe(PIN);
  });

  test("withdraw: the owner is part of the delete filter, so someone else's complaint is 404", async () => {
    const del = jest.spyOn(Complaints, 'findOneAndDelete').mockResolvedValue(null);
    const res = await request(app)
      .delete(`/api/my-complaints/withdraw-complaint/${ID.complaint}`)
      .set(bearer(token.student()));
    expect(res.status).toBe(404);
    expect(del).toHaveBeenCalledWith({ _id: ID.complaint, studentPinNo: PIN });
  });

  test('withdraw also deletes the stored image file', async () => {
    const file = path.join(UPLOADS_DIR, 'image-withdraw-test.png');
    fs.writeFileSync(file, PNG);
    jest.spyOn(Complaints, 'findOneAndDelete').mockResolvedValue({
      _id: ID.complaint, anonymous: false, studentPinNo: PIN, image: 'uploads/image-withdraw-test.png',
    });
    const res = await request(app)
      .delete(`/api/my-complaints/withdraw-complaint/${ID.complaint}`)
      .set(bearer(token.student()));
    expect(res.status).toBe(200);
    await wait(100);
    expect(fs.existsSync(file)).toBe(false);
  });

  test('removeUploadedFile cannot be tricked into deleting files outside uploads/', () => {
    const outside = path.join(UPLOADS_DIR, '..', 'package.json');
    removeUploadedFile('../package.json');
    removeUploadedFile('../../etc/passwd');
    expect(fs.existsSync(outside)).toBe(true);
  });

  test('a student token missing its pin/id is refused (guards against { field: undefined } filters)', async () => {
    const find = jest.spyOn(Complaints, 'find');
    const bad = sign({ role: 'student' });
    const res = await request(app).get(`/api/my-complaints/${PIN}`).set(bearer(bad));
    expect(res.status).toBe(401);
    expect(find).not.toHaveBeenCalled();
  });

  test("HOD cannot list another HOD's complaints", async () => {
    const find = jest.spyOn(Complaints, 'find');
    const res = await request(app).get(`/api/my-assigned-complaints/${ID.otherHod}`).set(bearer(token.hod()));
    expect(res.status).toBe(403);
    expect(find).not.toHaveBeenCalled();
  });

  test('HOD status update is limited to complaints assigned to them and not escalated', async () => {
    const upd = jest.spyOn(Complaints, 'findOneAndUpdate').mockResolvedValue(null);
    const res = await request(app)
      .put(`/api/modify-complaint/${ID.complaint}`)
      .set(bearer(token.hod()))
      .send({ status: 'Resolved' });
    expect(res.status).toBe(404);
    expect(upd.mock.calls[0][0]).toEqual({ _id: ID.complaint, assignedTo: ID.hod, escalatedTo: null });
  });

  test('HOD cannot set admin/system-only statuses or invent new ones', async () => {
    const upd = jest.spyOn(Complaints, 'findOneAndUpdate');
    for (const status of ['Escalated', 'Re-Assigned', 'Hacked', '']) {
      const res = await request(app)
        .put(`/api/modify-complaint/${ID.complaint}`)
        .set(bearer(token.hod()))
        .send({ status });
      expect(res.status).toBe(400);
    }
    expect(upd).not.toHaveBeenCalled();
  });

  test('HOD valid update succeeds, hides anonymous identity, and notifies', async () => {
    jest.spyOn(Complaints, 'findOneAndUpdate').mockResolvedValue({
      _id: ID.complaint, status: 'Resolved', anonymous: true, studentPinNo: PIN, submittedBy: null,
    });
    const res = await request(app)
      .put(`/api/modify-complaint/${ID.complaint}`)
      .set(bearer(token.hod()))
      .send({ status: 'Resolved' });
    expect(res.status).toBe(200);
    expect(res.body.complaint.studentPinNo).toBeUndefined();
    expect(notifications.statusChanged).toHaveBeenCalledTimes(1);
  });

  test('malformed ids are rejected with 400, not a 500 crash', async () => {
    const res = await request(app).delete('/api/my-complaints/withdraw-complaint/not-an-id').set(bearer(token.student()));
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// 3. DATA SANITIZATION
// ---------------------------------------------------------------------------
describe('data sanitization', () => {
  const complaints = [
    { _id: 'c1', anonymous: true, studentPinNo: PIN, submittedBy: ID.student, complaintTitle: 'Anon', __v: 0 },
    { _id: 'c2', anonymous: false, studentPinNo: PIN, submittedBy: ID.student, complaintTitle: 'Named', __v: 0 },
  ];

  test('admin and HOD cannot see who sent an anonymous complaint', async () => {
    jest.spyOn(Complaints, 'find').mockReturnValue(leanOf(complaints));
    const adminRes = await request(app).get('/api/all-complaints').set(bearer(token.admin()));
    const [anon, named] = adminRes.body.complaints;
    expect(anon).not.toHaveProperty('studentPinNo');
    expect(anon).not.toHaveProperty('submittedBy');
    expect(anon).not.toHaveProperty('__v');
    expect(named.studentPinNo).toBe(PIN); // non-anonymous complaints are unchanged

    const hodRes = await request(app).get(`/api/my-assigned-complaints/${ID.hod}`).set(bearer(token.hod()));
    expect(hodRes.body.myComplaints[0]).not.toHaveProperty('studentPinNo');
  });

  test('login response never contains the password hash or stored refresh token', async () => {
    const hash = await bcrypt.hash('Passw0rd!', 4);
    const doc = new Admins({ name: 'Test Admin', adminId: 'A-1', email: 'admin@x.com', password: hash });
    jest.spyOn(Admins, 'findOne').mockReturnValue({ select: async () => doc });
    const update = jest.spyOn(Admins, 'updateOne').mockResolvedValue({ modifiedCount: 1 });

    const res = await request(app).post('/api/login-admin').send({ email: 'admin@x.com', password: 'Passw0rd!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.admin.email).toBe('admin@x.com');
    expect(res.body.admin).not.toHaveProperty('password');
    expect(res.body.admin).not.toHaveProperty('refreshToken');
    expect(JSON.stringify(res.body)).not.toContain(hash);

    // token carries the admin id now, and the DB stores only a HASH of the refresh token
    expect(jwt.decode(res.body.accessToken)).toMatchObject({ role: 'admin', adminId: String(doc._id) });
    const stored = update.mock.calls[0][1].$set.refreshToken;
    expect(stored).toBe(hashToken(res.body.refreshToken));
    expect(stored).not.toBe(res.body.refreshToken);
  });

  test('unknown email and wrong password give the same answer (no user enumeration)', async () => {
    const hash = await bcrypt.hash('Passw0rd!', 4);
    const doc = new Admins({ name: 'Test Admin', adminId: 'A-1', email: 'admin@x.com', password: hash });
    const find = jest.spyOn(Admins, 'findOne');
    find.mockReturnValueOnce({ select: async () => null });
    const unknown = await request(app).post('/api/login-admin').send({ email: 'nobody@x.com', password: 'Passw0rd!' });
    find.mockReturnValueOnce({ select: async () => doc });
    const wrong = await request(app).post('/api/login-admin').send({ email: 'admin@x.com', password: 'WrongPass1' });
    expect(unknown.body).toEqual(wrong.body);
    expect(unknown.body).toEqual({ success: false, message: 'Invalid credentials' });
  });

  test('NoSQL-injection login payloads are rejected before reaching the database', async () => {
    const find = jest.spyOn(Admins, 'findOne');
    const res = await request(app).post('/api/login-admin').send({ email: { $gt: '' }, password: { $gt: '' } });
    expect(res.status).toBe(400);
    expect(find).not.toHaveBeenCalled();
  });

  test('registration drops unknown fields (mass assignment) and stores a hashed password', async () => {
    jest.spyOn(Students, 'exists').mockResolvedValue(null);
    const create = jest.spyOn(Students, 'create').mockImplementation(async (d) => new Students(d));
    const res = await request(app)
      .post('/api/register-student')
      .set(bearer(token.admin()))
      .send({
        name: 'New Student', pinNo: 'PIN0000000099', email: 'new@x.com', password: 'Str0ngPass!',
        branch: 'CSE', yearOfStudy: '2',
        role: 'admin', refreshToken: 'planted', _id: '64b0000000000000000000ff', isAdmin: true,
      });
    expect(res.status).toBe(200);
    const arg = create.mock.calls[0][0];
    expect(arg).not.toHaveProperty('role');
    expect(arg).not.toHaveProperty('refreshToken');
    expect(arg).not.toHaveProperty('_id');
    expect(arg).not.toHaveProperty('isAdmin');
    expect(arg.yearOfStudy).toBe(2);
    expect(arg.password).not.toBe('Str0ngPass!');
    expect(await bcrypt.compare('Str0ngPass!', arg.password)).toBe(true);
    expect(res.body.newStudent).not.toHaveProperty('password');
    expect(res.body.newStudent.role).toBe('student');
  });

  test('registration rejects short passwords and bad emails', async () => {
    const create = jest.spyOn(Students, 'create');
    const base = { name: 'New Student', pinNo: 'PIN0000000099', email: 'new@x.com', password: 'Str0ngPass!', branch: 'CSE', yearOfStudy: 2 };
    for (const bad of [{ password: '12345' }, { email: 'not-an-email' }, { pinNo: 'short' }]) {
      const res = await request(app).post('/api/register-student').set(bearer(token.admin())).send({ ...base, ...bad });
      expect(res.status).toBe(400);
    }
    expect(create).not.toHaveBeenCalled();
  });

  test('admin/HOD/student lists never include password hashes', async () => {
    // select:false on the schema means the DB never returns them; this checks the schema setting itself
    for (const Model of [Students, Admins]) {
      expect(Model.schema.path('password').options.select).toBe(false);
      expect(Model.schema.path('refreshToken').options.select).toBe(false);
    }
  });

  test('email templates escape HTML in user-supplied text', () => {
    const { complaintRaisedTemplate } = require('../src/modules/notifications/email.service');
    const html = complaintRaisedTemplate('<b>Bob</b>', '<script>alert(1)</script>', 'id1');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

// ---------------------------------------------------------------------------
// 4. REFRESH TOKENS (the old endpoint threw on every call)
// ---------------------------------------------------------------------------
describe('refresh tokens', () => {
  const user = { _id: ID.student, pinNo: PIN };

  test('valid refresh token returns new tokens and rotates the stored hash', async () => {
    const old = issueTokens('student', user);
    jest.spyOn(Students, 'findOne').mockResolvedValue(user);
    const update = jest.spyOn(Students, 'updateOne').mockResolvedValue({ modifiedCount: 1 });

    const res = await request(app).post('/api/refresh-token').send({ refreshToken: old.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.refreshToken).not.toBe(old.refreshToken);
    expect(jwt.decode(res.body.accessToken)).toMatchObject({ role: 'student', studentPinNo: PIN });
    // lookup and rotation both use the HASH of the presented token
    expect(Students.findOne).toHaveBeenCalledWith({ refreshToken: hashToken(old.refreshToken) });
    expect(update.mock.calls[0][0]).toEqual({ _id: ID.student, refreshToken: hashToken(old.refreshToken) });
    expect(update.mock.calls[0][1].$set.refreshToken).toBe(hashToken(res.body.refreshToken));
  });

  test('re-using an already-rotated refresh token is rejected', async () => {
    const old = issueTokens('student', user);
    jest.spyOn(Students, 'findOne').mockResolvedValue(null);
    const res = await request(app).post('/api/refresh-token').send({ refreshToken: old.refreshToken });
    expect(res.status).toBe(403);
  });

  test('two simultaneous refreshes cannot both succeed', async () => {
    const old = issueTokens('student', user);
    jest.spyOn(Students, 'findOne').mockResolvedValue(user);
    jest.spyOn(Students, 'updateOne').mockResolvedValue({ modifiedCount: 0 }); // someone else rotated first
    const res = await request(app).post('/api/refresh-token').send({ refreshToken: old.refreshToken });
    expect(res.status).toBe(403);
  });

  test('an access token cannot be used as a refresh token', async () => {
    const res = await request(app).post('/api/refresh-token').send({ refreshToken: token.student() });
    expect(res.status).toBe(403);
  });

  test('missing refresh token -> 400', async () => {
    expect((await request(app).post('/api/refresh-token').send({})).status).toBe(400);
  });

  test('logout clears the stored hash', async () => {
    const old = issueTokens('hod', { _id: ID.hod });
    const { hodModel } = require('../src/models/user.model');
    const update = jest.spyOn(hodModel, 'updateOne').mockResolvedValue({ modifiedCount: 1 });
    const res = await request(app).post('/api/logout').send({ refreshToken: old.refreshToken });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ refreshToken: hashToken(old.refreshToken) }, { $set: { refreshToken: null } });
  });
});

// ---------------------------------------------------------------------------
// 5. COMPLAINT CREATION + UPLOADS
// ---------------------------------------------------------------------------
describe('raising complaints and uploads', () => {
  const dept = { branchName: 'CSE', hodRef: ID.hod, autoAssign: true };
  const form = (r, over = {}) => {
    const f = { complaintTitle: 'Broken fan in lab', complaintDescription: 'The fan is terrible and broken', branchName: 'CSE', anonymous: 'false', ...over };
    Object.entries(f).forEach(([k, v]) => r.field(k, v));
    return r;
  };
  const mockHappyPath = () => {
    jest.spyOn(Departments, 'findOne').mockReturnValue(leanOf(dept));
    jest.spyOn(Complaints, 'exists').mockResolvedValue(null);
    return jest.spyOn(Complaints, 'create').mockImplementation(async (d) => ({ _id: ID.complaint, ...d }));
  };

  test('anonymous complaint: submittedBy is null, pin comes from the token, notification skipped by the service', async () => {
    const create = mockHappyPath();
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())), { anonymous: 'true' });
    expect(res.status).toBe(200);
    const doc = create.mock.calls[0][0];
    expect(doc.submittedBy).toBeNull();
    expect(doc.studentPinNo).toBe(PIN);
    expect(doc.anonymous).toBe(true);
    expect(doc.assignedTo).toBe(ID.hod);
    expect(['Low', 'Medium', 'High']).toContain(doc.urgency);
  });

  test('a student cannot submit as someone else (body pin / submittedBy are ignored)', async () => {
    const create = mockHappyPath();
    await form(request(app).post('/api/raise-complaint').set(bearer(token.student())))
      .field('studentPinNo', OTHER_PIN).field('submittedBy', ID.hod).field('status', 'Resolved').field('assignedTo', ID.admin);
    const doc = create.mock.calls[0][0];
    expect(doc.studentPinNo).toBe(PIN);
    expect(doc.submittedBy).toBe(ID.student);
    expect(doc).not.toHaveProperty('status');
    expect(doc.assignedTo).toBe(ID.hod);
    expect(notifications.complaintRaised).toHaveBeenCalledTimes(1);
  });

  test('valid image is stored with a random name and an allow-listed extension', async () => {
    mockHappyPath();
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())))
      .attach('image', PNG, { filename: '../../evil.php', contentType: 'image/png' });
    expect(res.status).toBe(200);
    expect(res.body.complaint.image).toMatch(/^uploads\/image-\d+-[0-9a-f]{16}\.png$/);
    expect(uploadedFiles()).toHaveLength(1);
  });

  test('non-image upload is rejected and nothing is saved', async () => {
    const create = mockHappyPath();
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())))
      .attach('image', Buffer.from('<?php echo 1; ?>'), { filename: 'shell.php', contentType: 'application/x-php' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only image files are allowed!');
    expect(create).not.toHaveBeenCalled();
    expect(uploadedFiles()).toHaveLength(0);
  });

  test('upload larger than 5MB is rejected with 400', async () => {
    mockHappyPath();
    const big = Buffer.alloc(5 * 1024 * 1024 + 10, 1);
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())))
      .attach('image', big, { filename: 'big.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(uploadedFiles()).toHaveLength(0);
  });

  test('validation failure after a good upload deletes the orphaned file', async () => {
    mockHappyPath();
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())), { complaintTitle: 'x' })
      .attach('image', PNG, { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    await wait(150);
    expect(uploadedFiles()).toHaveLength(0);
  });

  test("duplicate title is only blocked for the same student, and says 409", async () => {
    mockHappyPath();
    const exists = jest.spyOn(Complaints, 'exists').mockResolvedValue({ _id: 'x' });
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())));
    expect(res.status).toBe(409);
    expect(exists).toHaveBeenCalledWith({ complaintTitle: 'Broken fan in lab', studentPinNo: PIN });
  });

  test('unknown department -> 404 and no complaint created', async () => {
    jest.spyOn(Departments, 'findOne').mockReturnValue(leanOf(null));
    const create = jest.spyOn(Complaints, 'create');
    const res = await form(request(app).post('/api/raise-complaint').set(bearer(token.student())));
    expect(res.status).toBe(404);
    expect(create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 6. HARDENING: headers, rate limiting, error handling, static files
// ---------------------------------------------------------------------------
describe('hardening', () => {
  test('security headers are present and x-powered-by is hidden', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  test('login is rate-limited per (IP + email): 429 after 10 attempts', async () => {
    jest.spyOn(Admins, 'findOne').mockReturnValue({ select: async () => null });
    const send = () => request(app).post('/api/login-admin').send({ email: 'brute@x.com', password: 'guess-guess' });
    for (let i = 0; i < 10; i += 1) expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(429);
    // a different email from the same IP is not locked out
    const other = await request(app).post('/api/login-admin').send({ email: 'other@x.com', password: 'guess-guess' });
    expect(other.status).toBe(200);
  });

  test('errors never leak stack traces or raw error objects', async () => {
    jest.spyOn(Complaints, 'find').mockImplementation(() => { throw new Error('secret db detail: mongodb://user:pass@host'); });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await request(app).get('/api/all-complaints').set(bearer(token.admin()));
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: 'Internal Server Error' });
  });

  test('duplicate-key database errors become a clean 409', async () => {
    jest.spyOn(Students, 'exists').mockResolvedValue(null);
    jest.spyOn(Students, 'create').mockRejectedValue(Object.assign(new Error('E11000'), { code: 11000, keyValue: { pinNo: 'PIN1' } }));
    const res = await request(app).post('/api/register-student').set(bearer(token.admin()))
      .send({ name: 'New Student', pinNo: 'PIN0000000099', email: 'new@x.com', password: 'Str0ngPass!', branch: 'CSE', yearOfStudy: 2 });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe('pinNo already exists');
  });

  test('malformed JSON -> 400, oversized body -> 413, unknown route -> 404', async () => {
    expect((await request(app).post('/api/login-admin').set('Content-Type', 'application/json').send('{bad json')).status).toBe(400);
    expect((await request(app).post('/api/login-admin').send({ email: 'a@b.c', password: 'x'.repeat(200 * 1024) })).status).toBe(413);
    expect((await request(app).get('/api/nope')).status).toBe(404);
  });

  test('/uploads still serves images (frontend compatibility) with nosniff', async () => {
    fs.writeFileSync(path.join(UPLOADS_DIR, 'image-static-test.png'), PNG);
    const res = await request(app).get('/uploads/image-static-test.png');
    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    fs.unlinkSync(path.join(UPLOADS_DIR, 'image-static-test.png'));
  });

  test('department modify only sends fields that were provided and validates them', async () => {
    const upd = jest.spyOn(Departments, 'findByIdAndUpdate').mockResolvedValue({ _id: ID.complaint, branchName: 'CSE' });
    const ok = await request(app).put(`/api/all-departments/modify-department/${ID.complaint}`).set(bearer(token.admin())).send({ escalationDays: '5', role: 'x' });
    expect(ok.status).toBe(200);
    expect(upd.mock.calls[0][1]).toEqual({ $set: { escalationDays: 5 } });
    for (const bad of [{}, { escalationDays: 0 }, { escalationDays: 'abc' }, { hodRef: 'nope' }]) {
      const res = await request(app).put(`/api/all-departments/modify-department/${ID.complaint}`).set(bearer(token.admin())).send(bad);
      expect(res.status).toBe(400);
    }
  });

  test('admin modify: unknown complaint is a clean 404 (it used to crash)', async () => {
    jest.spyOn(Departments, 'findOne').mockReturnValue(leanOf({ branchName: 'CSE', hodRef: ID.hod }));
    jest.spyOn(Complaints, 'findByIdAndUpdate').mockResolvedValue(null);
    const res = await request(app).put(`/api/all-complaints/modify-complaint/${ID.complaint}`).set(bearer(token.admin()))
      .send({ branchName: 'CSE', status: 'Resolved' });
    expect(res.status).toBe(404);
  });

  test('admin modify: Re-Assigned clears escalatedTo; invalid status rejected', async () => {
    jest.spyOn(Departments, 'findOne').mockReturnValue(leanOf({ branchName: 'CSE', hodRef: ID.hod }));
    const upd = jest.spyOn(Complaints, 'findByIdAndUpdate').mockResolvedValue({ _id: ID.complaint, anonymous: false, status: 'Re-Assigned' });
    const ok = await request(app).put(`/api/all-complaints/modify-complaint/${ID.complaint}`).set(bearer(token.admin()))
      .send({ branchName: 'CSE', status: 'Re-Assigned' });
    expect(ok.status).toBe(200);
    expect(upd.mock.calls[0][1].$set).toEqual({ assignedTo: ID.hod, status: 'Re-Assigned', branchName: 'CSE', escalatedTo: null });
    const bad = await request(app).put(`/api/all-complaints/modify-complaint/${ID.complaint}`).set(bearer(token.admin()))
      .send({ branchName: 'CSE', status: 'Re-Solved' });
    expect(bad.status).toBe(400);
  });

  test('add-department: no matching HOD is a clean 404 (it used to crash)', async () => {
    const { hodModel } = require('../src/models/user.model');
    jest.spyOn(Departments, 'findOne').mockReturnValue(leanOf(null));
    jest.spyOn(hodModel, 'findOne').mockReturnValue({ select: () => leanOf(null) });
    const res = await request(app).post('/api/add-department').set(bearer(token.admin())).send({ branchName: 'MECH', assignTo: 'MECH' });
    expect(res.status).toBe(404);
  });
});
