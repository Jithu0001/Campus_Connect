const cron = require('node-cron');
const Complaints = require('../models/complaint.model');
const Departments = require('../models/department.model');
const { adminModel: Admins } = require('../models/user.model');

// Complaints in these states are never escalated.
// ('Escalated' was missing before, so already-escalated complaints were re-escalated every
//  night and their escalatedAt date kept being overwritten.)
const SKIP_STATUSES = ['Resolved', 'Closed', 'Re-Assigned', 'Escalated'];
const DAY_MS = 24 * 60 * 60 * 1000;

// One query per department instead of one query per complaint.
// Exported on its own so a later phase can call it from a secured endpoint.
async function runEscalation(now = new Date()) {
  const admin = await Admins.findOne().select('_id').lean();
  if (!admin) {
    console.warn('[escalation] no admin account exists - nothing escalated');
    return { escalated: 0 };
  }
  const departments = await Departments.find().select('branchName escalationDays').lean();

  let escalated = 0;
  for (const dept of departments) {
    const cutoff = new Date(now.getTime() - (dept.escalationDays || 7) * DAY_MS);
    const result = await Complaints.updateMany(
      { branchName: dept.branchName, status: { $nin: SKIP_STATUSES }, createdAt: { $lt: cutoff } },
      { $set: { status: 'Escalated', escalatedTo: admin._id, escalatedBy: admin._id, escalatedAt: now } }
    );
    escalated += result.modifiedCount;
  }
  console.log(`[escalation] escalated ${escalated} complaint(s)`);
  return { escalated };
}

// Every day at midnight, India time (the server's own timezone is no longer assumed).
function scheduleEscalation() {
  return cron.schedule(
    '0 0 * * *',
    () => runEscalation().catch((err) => console.error('[escalation] job failed:', err.message)),
    { timezone: 'Asia/Kolkata' }
  );
}

module.exports = { runEscalation, scheduleEscalation };
