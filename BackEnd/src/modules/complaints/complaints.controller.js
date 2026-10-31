const service = require('./complaints.service');
const { presentComplaint, presentComplaints } = require('./present');

// ---------- student ----------
const raise = async (req, res) => {
  const complaint = await service.raise(req.user, req.body, req.files);
  res.json({
    complaint: presentComplaint(complaint, 'student'),
    message: 'Complaint Raised Successfully',
    studentId: req.user.studentId,
    studentPinNo: req.user.studentPinNo,
    success: true,
  });
};

const listMine = async (req, res) => {
  const list = await service.listMine(req.user, req.params.pinNo);
  if (list.length === 0) return res.json({ message: 'No complaints', success: false });
  return res.json({ myComplaints: presentComplaints(list, 'student') });
};

const withdraw = async (req, res) => {
  const complaint = await service.withdraw(req.user, req.params.id);
  res.json({
    message: 'Complaint Withdrawn Successfully!',
    complaint: presentComplaint(complaint, 'student'),
    success: true,
  });
};

// ---------- HOD ----------
const listAssigned = async (req, res) => {
  const list = await service.listAssigned(req.user, req.params.id);
  if (list.length === 0) return res.json({ message: 'No complaints', success: false });
  return res.json({ myComplaints: presentComplaints(list, 'hod') });
};

const hodUpdateStatus = async (req, res) => {
  const complaint = await service.hodUpdateStatus(req.user, req.params.id, req.body.status);
  res.json({ message: 'Status updated successfully!', complaint: presentComplaint(complaint, 'hod'), success: true });
};

// ---------- admin ----------
const listAll = async (req, res) => {
  res.json({ complaints: presentComplaints(await service.listAll(), 'admin') });
};

const adminModify = async (req, res) => {
  const complaint = await service.adminModify(req.params.id, req.body);
  res.json({
    message: 'Complaint details updated successfully!',
    success: true,
    complaint: presentComplaint(complaint, 'admin'),
  });
};

module.exports = { raise, listMine, withdraw, listAssigned, hodUpdateStatus, listAll, adminModify };
