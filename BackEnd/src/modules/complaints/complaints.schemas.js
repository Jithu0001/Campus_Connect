const { z } = require('zod');
const { COMPLAINT_STATUSES } = require('../../models/constants');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'must be a valid id');
const idParams = z.object({ id: objectId });
const pinParams = z.object({ pinNo: z.string().min(1).max(30) });

// Multipart forms send everything as text, so "true"/"false" strings are accepted.
const booleanish = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean().default(false)
);

const raiseComplaintSchema = z.object({
  complaintTitle: z.string().trim().min(3).max(200),
  complaintDescription: z.string().trim().min(1).max(5000),
  branchName: z.string().trim().min(2).max(100),
  anonymous: booleanish,
});

// A HOD may only move their own complaints through these statuses. Escalated and
// Re-Assigned are system/admin actions. (Change HOD_STATUSES here if your UI needs more.)
const HOD_STATUSES = ['In-Progress', 'Resolved', 'Closed'];
const hodUpdateSchema = z.object({ status: z.enum(HOD_STATUSES) });

const adminModifySchema = z.object({
  branchName: z.string().trim().min(2).max(100),
  status: z.enum(COMPLAINT_STATUSES),
});

module.exports = { idParams, pinParams, raiseComplaintSchema, hodUpdateSchema, adminModifySchema, HOD_STATUSES };
