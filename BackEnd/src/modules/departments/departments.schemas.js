const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'must be a valid id');
const idParams = z.object({ id: objectId });
const branchName = z.string().trim().min(2).max(100);

const addDepartmentSchema = z.object({
  branchName,
  assignTo: z.string().trim().min(1).max(100), // the branch of the HOD who will own it
  hodRef: objectId.optional(),
});

const modifyDepartmentSchema = z
  .object({
    branchName: branchName.optional(),
    hodRef: objectId.optional(),
    autoAssign: z.boolean().optional(),
    escalationDays: z.coerce.number().int().min(1).max(365).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'Provide at least one field to update' });

module.exports = { idParams, addDepartmentSchema, modifyDepartmentSchema };
