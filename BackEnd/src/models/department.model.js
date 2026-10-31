const mongoose = require("mongoose");

// Was "settingModel.js". The model name 'Departments' is unchanged.
const departmentSchema = new mongoose.Schema(
  {
    branchName: { type: String, required: true, minlength: 2 },
    hodRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hod",
      required: true,
    },
    autoAssign: { type: Boolean, default: true },
    urgencyLevels: { type: [String], default: ["Low", "Medium", "High"] },
    escalationDays: { type: Number, default: 7 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Departments", departmentSchema);
