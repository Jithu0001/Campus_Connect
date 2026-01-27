const cron = require('node-cron');
const Complaints = require('../Models/complaintModel');
const Branches = require('../Models/settingModel');
const userModel = require('../Models/userModel');
const Admins = userModel.adminModel

// Run every day at midnight
async function escalation(){
    cron.schedule('0 0 * * *', async () => {
  console.log("Running escalation job...");
  console.log("Cron triggered at: ", Date())

  try {
    const complaints = await Complaints.find({
      status: { $nin: ["Resolved", "Closed", "Re-Assigned"] }
    });
    // console.log(complaints)
    for (const complaint of complaints) {
      const branch = await Branches.findOne({ branchName: complaint.branchName });
      if (!branch) continue;

      const escalationDays = branch.escalationDays || 7;
      const ageInDays = (Date.now() - complaint.createdAt) / (1000 * 60 * 60 * 24);

      if (ageInDays > escalationDays) {
        const admin = await Admins.findOne();
        if (!admin) continue;

        complaint.escalatedTo = admin._id; 
        complaint.status = "Escalated";   
        complaint.escalatedAt = new Date();
        complaint.escalatedBy = admin._id;

        await complaint.save();
        console.log(`Complaint ${complaint._id} escalated to Admin`);
      }
    }
  } catch (err) {
    console.error("Escalation job failed:", err);
  }
})}
module.exports = escalation