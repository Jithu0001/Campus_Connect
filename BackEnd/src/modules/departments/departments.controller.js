const service = require('./departments.service');

const list = async (req, res) => res.json({ departments: await service.list() });

const add = async (req, res) => {
  const result = await service.add(req.body);
  // Existing behaviour kept: an already-existing department answers 200 with the old message.
  if (result.duplicate) {
    return res.json({ message: 'Department already Exists!!', branch: result.duplicate, success: true });
  }
  return res.json({ message: 'Department added successfully!!', newBranch: result.department, success: true });
};

const modify = async (req, res) => {
  const department = await service.modify(req.params.id, req.body);
  res.json({ message: 'Department details updated succesfully!', department, success: true });
};

const remove = async (req, res) => {
  const department = await service.remove(req.params.id);
  res.json({ message: 'Department Deleted Succesfully!', department, success: true });
};

module.exports = { list, add, modify, remove };
