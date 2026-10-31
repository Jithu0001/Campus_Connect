const mongoose = require("mongoose");
const { COMPLAINT_STATUSES, URGENCY_LEVELS } = require("./constants");
const imageAttachmentSchema = mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);
const complaintSchema = new mongoose.Schema(
  {
    complaintTitle: { type: String, required: true, minlength: 3 },
    complaintDescription: { type: String, required: true },
    anonymous: { type: Boolean, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Students" },
    branchName: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Hod" },
    urgency: { type: String, enum: URGENCY_LEVELS },
    status: { type: String, enum: COMPLAINT_STATUSES, default: "Submitted" },
    studentPinNo: { type: String },
    escalatedAt: { type: Date },
    escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admins" },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admins",
      default: null,
    },
    images: {
      type:[imageAttachmentSchema],
      default:[],
      validate:[arrayLimit, '{PATH} exceeds the limit of 3 attachments']
    }
  },
  { timestamps: true },
);
function arrayLimit(val){
  return val.length <=3;
}
module.exports = mongoose.model("Complaints", complaintSchema);
