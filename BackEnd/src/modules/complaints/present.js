// DATA SANITIZATION for complaints leaving the API.
// Students see everything about their own complaints. HODs and admins must NOT be able to
// learn who sent an ANONYMOUS complaint, so identity fields are removed for them.
function presentComplaint(complaint, viewerRole) {
  const obj = typeof complaint.toObject === 'function' ? complaint.toObject() : { ...complaint };
  delete obj.__v;
  if (viewerRole !== 'student' && obj.anonymous) {
    delete obj.submittedBy;
    delete obj.studentPinNo;
  }
  return obj;
}

const presentComplaints = (list, viewerRole) => list.map((c) => presentComplaint(c, viewerRole));

module.exports = { presentComplaint, presentComplaints };
