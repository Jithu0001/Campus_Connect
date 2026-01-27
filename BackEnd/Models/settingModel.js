const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  branchName: {
    type: String,
    required: true,
    minlength: 2
  },
  hodRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hod", 
    required: true
  },
  autoAssign: {
    type: Boolean,
    default: true
  },
  urgencyLevels: {
    type: [String],  
    default: ["Low", "Medium", "High"]
  },
  escalationDays: {
    type: Number,    
    default: 7
  }
}, { timestamps: true });

const settingModel = mongoose.model("Departments", settingSchema);
module.exports = settingModel;
