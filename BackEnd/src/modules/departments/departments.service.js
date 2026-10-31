const Departments = require('../../models/department.model');
const { hodModel: Hods } = require('../../models/user.model');
const { HttpError } = require('../../utils/httpError');

const list = () => Departments.find().lean();

// Returns { duplicate } if it already exists, otherwise { department }.
async function add({ branchName, assignTo, hodRef }) {
  const or = [{ branchName }];
  if (hodRef) or.push({ hodRef });
  const duplicate = await Departments.findOne({ $or: or }).lean();
  if (duplicate) return { duplicate };

  // The old code crashed (500) here when no HOD matched; now it's a clean 404.
  const hod = await Hods.findOne({ branch: assignTo }).select('_id').lean();
  if (!hod) throw new HttpError(404, `No HOD found for branch "${assignTo}"`);

  const department = await Departments.create({ branchName, hodRef: hod._id });
  return { department };
}

async function modify(id, changes) {
  if (changes.hodRef && !(await Hods.exists({ _id: changes.hodRef }))) {
    throw new HttpError(404, 'HOD not found');
  }
  const department = await Departments.findByIdAndUpdate(
    id,
    { $set: changes }, // only the fields that were actually sent
    { new: true, runValidators: true }
  );
  if (!department) throw new HttpError(404, 'Department not found!');
  return department;
}

async function remove(id) {
  const department = await Departments.findByIdAndDelete(id);
  if (!department) throw new HttpError(404, 'Department not found');
  return department;
}

module.exports = { list, add, modify, remove };
