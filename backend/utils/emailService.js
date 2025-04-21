const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send an email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
