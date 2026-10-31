const { studentModel: Students } = require('../../models/user.model');
const { sendEmail, complaintRaisedTemplate, statusUpdateTemplate } = require('./email.service');

// These helpers are "fire and forget": call them WITHOUT await so the HTTP response is
// not delayed, and they swallow their own errors so an email problem can never break
// a complaint submission or status update. (Phase 1 will move this onto a job queue.)

async function complaintRaised(studentId, complaint) {
  try {
    if (complaint.anonymous || !studentId) return; // anonymous = no email, as before
    const student = await Students.findById(studentId).select('name email').lean();
    if (!student?.email) return;
    await sendEmail(
      student.email,
      'Complaint Submitted Successfully',
      complaintRaisedTemplate(student.name, complaint.complaintTitle, complaint._id)
    );
  } catch (err) {
    console.error('[notify] complaintRaised failed:', err.message);
  }
}

async function statusChanged(complaint, newStatus) {
  try {
    if (complaint.anonymous || !complaint.submittedBy) return;
    const student = await Students.findById(complaint.submittedBy).select('name email').lean();
    if (!student?.email) return;
    await sendEmail(
      student.email,
      'Complaint Status Update',
      statusUpdateTemplate(student.name, complaint.complaintTitle, complaint._id, newStatus)
    );
  } catch (err) {
    console.error('[notify] statusChanged failed:', err.message);
  }
}

module.exports = { complaintRaised, statusChanged };
