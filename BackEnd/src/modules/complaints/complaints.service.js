const Complaints = require('../../models/complaint.model');
const Departments = require('../../models/department.model');
const { HttpError } = require('../../utils/httpError');
const { removeUploadedFile } = require('../../utils/files');
const notifications = require('../notifications/notifications.service');
const { analyzeUrgency } = require('./urgency');
const {uploadManyToCloudinary, deleteManyFromCloudinary, deleteFromCloudinary} = require('../../services/storage.service')
// OWNERSHIP RULE: identity always comes from the verified token (req.user), never from the URL.
// These guards also protect against a Mongo quirk: a filter like { assignedTo: undefined }
// would match every unassigned complaint, so a token missing its id must be refused outright.
function requireStudentIdentity(user) {
  if (!user.studentId || !user.studentPinNo) throw new HttpError(401, 'Invalid token');
}
function requireHodIdentity(user) {
  if (!user.hodId) throw new HttpError(401, 'Invalid token');
}

// ---------- student ----------
async function raise(user, body, files) {
  requireStudentIdentity(user);

  const department = await Departments.findOne({ branchName: body.branchName }).lean();
  if (!department) throw new HttpError(404, 'Department not exists!!');

  const duplicate = await Complaints.exists({
    complaintTitle: body.complaintTitle,
    studentPinNo: user.studentPinNo,
  });
  if (duplicate) throw new HttpError(409, 'Complaint already Submitted!');
  let uploadedImages = [];
  if(files && files.length > 0){
    const buffers = files.map(f => f.buffer);
    uploadedImages = await uploadManyToCloudinary(buffers)
  }
  const complaint = await Complaints.create({
    complaintTitle: body.complaintTitle,
    complaintDescription: body.complaintDescription,
    submittedBy: body.anonymous ? null : user.studentId,
    assignedTo: department.autoAssign ? department.hodRef : null,
    urgency: analyzeUrgency(body.complaintDescription),
    anonymous: body.anonymous,
    branchName: body.branchName,
    studentPinNo: user.studentPinNo,
    images: uploadedImages,
  });

  notifications.complaintRaised(user.studentId, complaint); // not awaited on purpose
  return complaint;
}

async function listMine(user, pinFromUrl) {
  requireStudentIdentity(user);
  // The :pinNo in the URL is kept for compatibility, but it must match the token's PIN.
  if (pinFromUrl !== user.studentPinNo) {
    throw new HttpError(403, 'Forbidden: you can only view your own complaints');
  }
  return Complaints.find({ studentPinNo: user.studentPinNo }).lean();
}

async function withdraw(user, id) {
  requireStudentIdentity(user);
  // The owner is part of the query itself, so someone else's complaint is simply "not found".
  const complaint = await Complaints.findOneAndDelete({ _id: id, studentPinNo: user.studentPinNo });
  if (!complaint) throw new HttpError(404, 'Complaint Not Found!');
  if(complaint.images && complaint.images.length > 0){
      const publicIdstoDelete = complaint.images.map(img=> img.publicId);
      deleteManyFromCloudinary(publicIdstoDelete);
  }
  return complaint;
}

// ---------- HOD ----------
async function listAssigned(user, idFromUrl) {
  requireHodIdentity(user);
  if (idFromUrl !== user.hodId) {
    throw new HttpError(403, 'Forbidden: you can only view your own assigned complaints');
  }
  return Complaints.find({ assignedTo: user.hodId }).lean();
}

async function hodUpdateStatus(user, id, status) {
  requireHodIdentity(user);
  const complaint = await Complaints.findOneAndUpdate(
    { _id: id, assignedTo: user.hodId, escalatedTo: null }, // must be theirs and not escalated
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!complaint) {
    throw new HttpError(404, 'Complaint not found, not assigned to you, or already escalated to admin');
  }
  notifications.statusChanged(complaint, status);
  return complaint;
}

// ---------- admin ----------
const listAll = () => Complaints.find().lean();

async function adminModify(id, { branchName, status }) {
  const department = await Departments.findOne({ branchName }).lean();
  if (!department) throw new HttpError(404, 'Branch not found!');

  const update = { assignedTo: department.hodRef, status, branchName };
  if (status === 'Re-Assigned') update.escalatedTo = null;

  // (The old "Re-Solved" check was dead code - that status doesn't exist - and crashed when
  //  the id was unknown. Both are gone.)
  const complaint = await Complaints.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  if (!complaint) throw new HttpError(404, 'Complaint not found to update!');
  notifications.statusChanged(complaint, status);
  return complaint;
}

module.exports = { raise, listMine, withdraw, listAssigned, hodUpdateStatus, listAll, adminModify };
