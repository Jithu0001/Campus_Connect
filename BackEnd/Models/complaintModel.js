const mongoose = require('mongoose');


const complaintSchema = new mongoose.Schema({
    complaintTitle: {
        type: String,
        required : true,
        minlength: 3
    },
    complaintDescription:{
        type: String,
        required : true,
    },
    anonymous:{
        type:Boolean,
        required: true
    },
    submittedBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Students",
    },
    branchName:{
        type : String,
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Hod"
    },
    urgency:{
        type: String,
        enum : ['Low', 'Medium', "High"]
    },
    status: {
        type: String,
        enum : ['Submitted', 'In-Progress', "Resolved", 'Re-Assigned', "Closed", "Escalated"],
        default : "Submitted",
    },
    studentPinNo :{
        type : String,
    },
    escalatedAt:{
        type: Date
    },
    escalatedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "admins"
    },
    escalatedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "admins",
        default: null
    },

}, {timestamps : true})

const complaintModel = mongoose.model('Complaints', complaintSchema);

module.exports = complaintModel