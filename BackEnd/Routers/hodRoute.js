const express = require("express");
const router = express.Router();
const authorization = require("../Middlewares/authMiddleware");
const authHod = authorization.authHod;
const Complaints = require("../Models/complaintModel");
const userModel = require("../Models/userModel");
const Hods = userModel.hodModel;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

router.post("/login-hod", async (req, res) => {
  try {
    const hod = await Hods.findOne({ email: req.body.email });
    if (!hod) return res.json({ message: "hod Not found", success: false });
    const isMatch = await bcrypt.compare(req.body.password, hod.password);
    if (!isMatch) return res.json({ message: "Invalid Password", success: false });
    const token = jwt.sign({ role: hod.role, hodId: hod._id }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ hod, hodName:hod.name, token, message: "Login Successfull!", success: true});
  } catch (err) {
    console.log(err);
    res.json({ err, success: false, message:err.message });
  }
});

router.get("/my-assigned-complaints/:id", authHod, async (req, res) => {
  try {
    const myComplaints = await Complaints.find({ assignedTo: req.params.id });
    if (!myComplaints || myComplaints.length === 0)
      return res.json({ message: "No complaints" });
    res.json({ myComplaints });
  } catch (err) {
    res.json({ err });
    console.log(err);
  }
});

router.put("/modify-complaint/:id",  async (req, res) => {
  try {
    const complaint = await Complaints.findOneAndUpdate(
      {_id : req.params.id, escalatedTo : null},
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!complaint || complaint.length === 0)
      return res.json({ message: "Escalated to admin", success: false });
    res.json({ message: "Status updated successfully!", complaint, success: true });
  } catch (err) {
    res.json({ err, success: false, message: err.message });
  }
});

module.exports = router;
