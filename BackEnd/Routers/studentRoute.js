const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");
const Students = userModel.studentModel;
const authorization = require("../Middlewares/authMiddleware");
const authStudent = authorization.authStudent;
const Complaints = require("../Models/complaintModel");
require("dotenv").config({ path: "file.env" });
const Branches = require("../Models/settingModel");
const secretKey = process.env.SECRET_KEY;
const sentiment = require("sentiment");
const Sentiment = new sentiment();

function analyzeUrgency(desc) {
  const result = Sentiment.analyze(desc);
  const { score } = result;

  if (score >= 0) return "Low";
  if (score <= -3) return "High";
  return "Medium";
}

router.post("/login-student", async (req, res) => {
  try {
    const student = await Students.findOne({ email: req.body.email });
    if (!student) return res.json({ message: "Student Not found", success: false });
    const isMatch = await bcrypt.compare(req.body.password, student.password);
    console.log(isMatch)
    if (!isMatch) return res.json({ message: "Invalid Credientials" });
    const token = jwt.sign(
      {
        role: student.role,
        studentId: student._id,
        studentPinNo: student.pinNo,
      },
      secretKey,
      { expiresIn: "1d" }
    );
    res.json({ token, message: "Login Successfull!",studentPinNo: student.pinNo, studentName: student.name, success: true});
  } catch (err) {
    res.json({ err, success: false, message: "Something Went Wrong!!" });
  }
});

router.post("/raise-complaint", authStudent, async (req, res) => {
  try {
    const branchSettings = await Branches.findOne({
      branchName: req.body.branchName,
    });
    console.log(branchSettings)
    if (!branchSettings)
      return res.json({ message: "Department not exists!!", success:false});
    const existingComplaint = await Complaints.findOne({
      complaintTitle: req.body.complaintTitle,
    });
    if (existingComplaint) {
      return res.json({ message: "Complaint already Submitted!",  success:false});
    }
    const complaint = new Complaints({
      complaintTitle: req.body.complaintTitle,
      complaintDescription: req.body.complaintDescription,
      submittedBy: req.body.anonymous ? null : req.user.studentId,
      assignedTo: branchSettings.autoAssign ? branchSettings.hodRef : null,
      urgency: analyzeUrgency(req.body.complaintDescription),
      anonymous: req.body.anonymous,
      branchName: req.body.branchName,
      studentPinNo: req.user.studentPinNo,
    });

    await complaint.save();
    res.json({
      complaint,
      message: "Complaint Raised Successfully",
      studentId: req.user.studentId,
      studentPinNo: req.user.studentPinNo,
      success:true
    });
  } catch (err) {
    console.log(err);
    res.send({err, success:false, message: "Something Went Wrong!!"});
  }
});
router.get("/my-complaints/:pinNo", authStudent, async (req, res) => {
  try {
    const myComplaints = await Complaints.find({
      studentPinNo: req.params.pinNo,
    });
    if (!myComplaints || myComplaints.length === 0)
      return res.json({ message: " No complaints", success:false, });
    res.json({ myComplaints });
  } catch (err) {
    res.json({ err, success:false, message: "Something Went Wrong!!"});
    console.log(err);
  }
});

router.delete(
  "/my-complaints/withdraw-complaint/:id",
  authStudent,
  async (req, res) => {
    try {
      const complaint = await Complaints.findByIdAndDelete(req.params.id);
      if (!complaint) return res.json({ message: "Complaint Not Found!" });
      res.json({ message: "Complaint Withdrawn Successfully!", complaint, success:true });
    } catch (err) {
      res.json({ err, success:false, message: "Something Went Wrong!!" });
      console.log(err);
    }
  }
);


router.get("/all-departments", authStudent, async (req, res) => {
  try {
    const departments = await Branches.find();
    if (!departments) return res.json({ message: "No Departments found!", success:false });
    res.json({ departments });
  } catch (err) {
    console.log(err);
    res.json({ err, message: "Something went wrong", success:false });
  }
});
module.exports = router;
