const nodemailer = require("nodemailer");
const env = require("../../config/env");
const { escapeHtml } = require("../../utils/escapeHtml");
const { success } = require("zod");

// let transporter = null;

// // Created lazily, so merely importing this file never opens a network connection.
// function getTransporter() {
//   if (!env.EMAIL_USER || !env.EMAIL_PASS) return null;
//   // SECURITY: the old code set tls.rejectUnauthorized=false, which turns off certificate
//   // checking. Removed - Gmail's certificate is valid, so it was never needed.
//   transporter ??= nodemailer.createTransport({
//     service: "gmail",
//     auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
//   });
//   return transporter;
// }

// // Called once at startup. Never crashes the server.
// async function verifyEmailTransport() {
//   const t = getTransporter();
//   if (!t)
//     return console.warn(
//       "[email] EMAIL_USER / EMAIL_PASS not set - emails are disabled.",
//     );
//   try {
//     await t.verify();
//     console.log("[email] transporter ready");
//   } catch (err) {
//     console.error("[email] transporter verification failed:", err.message);
//   }
// }

// Never throws; returns { success, messageId | error }.
async function sendEmail(to, subject, html) {
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) {
    return { success: false, message: "Keys are not configured" };
  }
  const payload = {
    sender: {
      name: "Campus Connect",
      email: `${env.EMAIL_FROM}`,
    },
    to: [
      {
        email: to,
      },
    ],
    subject: subject,
    htmlContent: html,
  };
  const url = "https://api.brevo.com/v3/smtp/email";
  try {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (!result.ok) {
  let errorDetails = '';
  try {
    // Brevo sends descriptive JSON errors like { "code": "invalid_parameter", "message": "..." }
    const errorJson = await result.json();
    errorDetails = ` - ${errorJson.message || errorJson.code}`;
  } catch (e) {
    // If Brevo didn't send JSON, get the status text (e.g., "Unauthorized")
    errorDetails = ` (${result.statusText})`;
  }
  
  // Clean extraction: uses result.status (number) instead of result (object)
  throw new Error(`HTTP error! Status Code: ${result.status}${errorDetails}`);
}

    const data = await result.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      console.error("[email] send failed: Request timed out");
      return { success: false, error: "Request timed out" };
    }
    console.error("[email] send failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Templates: every value that can contain user input goes through escapeHtml().
const wrap = (inner) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">${inner}
    <p>Best regards,<br>Campus Connect Team</p>
  </div>`;

const complaintRaisedTemplate = (studentName, complaintTitle, complaintId) =>
  wrap(`
    <h2 style="color: #333;">Complaint Submitted Successfully</h2>
    <p>Dear ${escapeHtml(studentName)},</p>
    <p>Your complaint has been successfully submitted to the Campus Connect system.</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Complaint Title:</strong> ${escapeHtml(complaintTitle)}</p>
      <p><strong>Complaint ID:</strong> ${escapeHtml(complaintId)}</p>
      <p><strong>Status:</strong> Submitted</p>
    </div>
    <p>You will receive updates on your complaint status via email.</p>
    <p>Thank you for using Campus Connect!</p>`);

const statusUpdateTemplate = (
  studentName,
  complaintTitle,
  complaintId,
  newStatus,
) =>
  wrap(`
    <h2 style="color: #333;">Complaint Status Update</h2>
    <p>Dear ${escapeHtml(studentName)},</p>
    <p>The status of your complaint has been updated.</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Complaint Title:</strong> ${escapeHtml(complaintTitle)}</p>
      <p><strong>Complaint ID:</strong> ${escapeHtml(complaintId)}</p>
      <p><strong>New Status:</strong> ${escapeHtml(newStatus)}</p>
    </div>
    <p>Please check the Campus Connect portal for more details.</p>
    <p>Thank you for your patience!</p>`);

module.exports = {
  sendEmail,
  // verifyEmailTransport,
  complaintRaisedTemplate,
  statusUpdateTemplate,
};
