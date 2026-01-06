const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

exports.notifyAdminOnApplication = onDocumentCreated(
  {
    document: "applications/{appId}",
    region: "us-central1",
  },
  async (event) => {
    const data = event.data.data();

    await transporter.sendMail({
      from: `"ATS" <${process.env.GMAIL_USER}>`,
      to: "admin@restorativecarehhs.com",
      subject: `New Job Application: ${data.jobTitle}`,
      text: `
New application received!

Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Job: ${data.jobTitle}
      `,
    });
  }
);
