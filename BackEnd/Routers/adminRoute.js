const express = require("express");
const router = express.Router();
const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const Students = userModel.studentModel;
const Hods = userModel.hodModel;
const Admins = userModel.adminModel;
const Complaints = require("../Models/complaintModel");
const authorizationMiddleware = require("../Middlewares/authMiddleware");
const authAdmin = authorizationMiddleware.authAdmin;
const jwt = require("jsonwebtoken");
const Branches = require("../Models/settingModel");
require("dotenv").config({ path: "file.env" });

const secretKey = process.env.SECRET_KEY;

router.post("/register-admin", authAdmin, async (req, res) => {
  try {
    const admin = await Admins.findOne({ email: req.body.email });
    if (admin) return res.json({ admin, message: "Admin already Registered!" });

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const newadmin = new Admins({ ...req.body, password: hashedPass });

    await newadmin.save();
    res.json({ newadmin, message: "Admin added Successfully!" });
  } catch (err) {
    console.log(err);
    res.json({err, success:false, message: err.errmsg});
  }
});
router.post("/register-student", authAdmin, async (req, res) => {
  try {
    const student = await Students.findOne({ email: req.body.email });
    if (student)
      return res.json({ student, message: "Student already Registered!" });

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const newStudent = new Students({ ...req.body, password: hashedPass });

    await newStudent.save();
    res.json({ newStudent, message: "Student added Successfully!" });
  } catch (err) {
    console.log(err);
    res.json({err, success:false, message: err.message})
  }
});

router.post("/register-hod", authAdmin, async (req, res) => {
  try {
    const hod = await Hods.findOne({ email: req.body.email });
    if (hod) return res.json({ hod, message: "hod already Registered!" });

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    const newhod = new Hods({ ...req.body, password: hashedPass });

    await newhod.save();
    res.json({ newhod, message: "Hod added Successfully!" });
  } catch (err) { 
    console.log(err);
    res.json({err, success:false, message: err.message});
  }
});
router.post("/login-admin", async (req, res) => {
  try {
    const admin = await Admins.findOne({ email: req.body.email });
    if (!admin) return res.json({ message: "admin Not found", success: false });
    const isMatch = await bcrypt.compare(req.body.password, admin.password);
    if (!isMatch) return res.json({ message: "Invalid Password", success: false });
    const token = jwt.sign({ role: admin.role }, secretKey, {
      expiresIn: "1h",
    });
    res.json({admin, token, message: "Login Successfull!", success: true });
  } catch (err) {
    res.status(500).json({err, success:false, message: err.message});
    console.log(err);
  }
});

router.post("/add-department", authAdmin, async (req, res) => {
  try {
    const hod = await Hods.findOne({branch : req.body.assignTo});
    const branch = await Branches.findOne({
      $or: [{ branchName: req.body.branchName }, { hodRef: req.body.hodRef }],
    });
    if (branch)
      return res.json({ message: "Department already Exists!!", branch, success:true });

    const newBranch = new Branches({
      branchName: req.body.branchName,
      hodRef: hod._id,
    });
    await newBranch.save();
    res.json({
      message: "Department added successfully!!",
      newBranch,
      success:true
    });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false});
  }
});

router.get("/students", authAdmin, async (req, res) => {
  try {
    const students = await Students.find();
    if (!students) return res.json({ message: "No Students data found", success:false});
    res.json({ students });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});

router.get("/hods", authAdmin, async (req, res) => {
  try {
    const hods = await Hods.find();
    if (!hods) return res.json({ message: "No Hods data found", success:false });
    res.json({ hods });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});

router.get("/admins", authAdmin, async (req, res) => {
  try {
    const admins = await Admins.find();
    if (!admins) return res.json({ message: "No admins data found", success:false});
    res.json({ admins });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});

router.get("/all-complaints", authAdmin, async (req, res) => {
  try {
    const complaints = await Complaints.find();
    if (!complaints) return res.json({ complaints });
    res.json({ complaints });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});

router.put(
  "/all-complaints/modify-complaint/:id",
  authAdmin,
  async (req, res) => {
    try {
      const branchSettings = await Branches.findOne({
        branchName: req.body.branchName,
      });

      if (!branchSettings) {
        return res.status(404).json({
          message: "Branch not found!",
          success: false,
        });
      }

      const updateData = {
        assignedTo: branchSettings.hodRef,
        status: req.body.status,
        branchName: req.body.branchName
      };

      // Clear escalatedTo only if complaint is re-assigned
      if (req.body.status === "Re-Assigned") {
        updateData.escalatedTo = null;
      }
      const comp = await Complaints.findOne({_id : req.params.id})
      if(comp.status == "Re-Solved") {
        return res.json({
          message: "Complaint already Re-Solved!",
          success: false,
        });
      }

      const complaint = await Complaints.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      

      if (!complaint) {
        return res.status(404).json({
          message: "Complaint not found to update!",
          success: false,
        });
      }
      
      
        res.json({
        message: "Complaint details updated successfully!",
        success: true,
        complaint,
      });
      

      
    } catch (err) {
      console.error(err);
      res.status(500).json({
        err,
        message: "Something went wrong",
        success: false,
      });
    }
  }
);


router.get("/all-departments", authAdmin, async (req, res) => {
  try {
    const departments = await Branches.find();
    if (!departments) return res.json({ message: "No Departments found!", success:false });
    res.json({ departments });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});

router.put(
  "/all-departments/modify-department/:id",
  authAdmin,
  async (req, res) => {
    try {
      const department = await Branches.findByIdAndUpdate(
        req.params.id,
        {
          branchName: req.body.branchName,
          hodRef: req.body.hodRef,
          autoAssign: req.body.autoAssign,
          escalationDays: req.body.escalationDays,
        },
        { new: true }
      );
      if (!department) return res.json({ message: "Department not found!", success:false });
      res.json({
        message: "Department details updated succesfully!",
        department,
        success:true
      });
    } catch (err) {
      console.log(err);
      res.json({ err, message: "Something went wrong", success:false });
    }
  }
);

router.delete(
  "/all-departments/delete-department/:id",
  authAdmin,
  async (req, res) => {
    try {
      const department = await Branches.findByIdAndDelete(req.params.id);
      if (!department) return res.json({ message: "Department not found", success:false });
      res.json({ message: "Department Deleted Succesfully!", department, success:true });
    } catch (err) {
      console.log(err);
      res.json({ err, message: "Something went wrong", success:false });
    }
  }
);
module.exports = router;
