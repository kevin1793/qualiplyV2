const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'qualiply.ats@gmail.com',
    pass: 'klso pxan papd vnag',
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
      from: `"ATS" <qualiply.ats@gmail.com>`,
      to: "kevin.d.claveria@gmail.com",
      subject: `New Job Application: ${data.jobTitle}`,
      text: `
New application received! Go to the admin panel and login to review the application.
https://restorativecarehhs.com/careers

Applicant Details:

Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}
Job: ${data.jobTitle}
      `,
    });
  }
);
