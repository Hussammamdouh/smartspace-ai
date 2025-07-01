const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configure transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SMTP
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Use Gmail or other service
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  welcome: (name, verificationUrl) => ({
    subject: 'Welcome to AI Interior Design - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to AI Interior Design!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with AI Interior Design. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The AI Interior Design Team</p>
      </div>
    `
  }),
  
  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request - AI Interior Design',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset for your AI Interior Design account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>This link will expire in 10 minutes.</p>
        <p>Best regards,<br>The AI Interior Design Team</p>
      </div>
    `
  }),
  
  emailVerified: (name) => ({
    subject: 'Email Verified - AI Interior Design',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Email Verified Successfully!</h2>
        <p>Hi ${name},</p>
        <p>Your email has been successfully verified. You can now access all features of AI Interior Design.</p>
        <p>Best regards,<br>The AI Interior Design Team</p>
      </div>
    `
  })
};

// Send an email
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };
    
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${subject}`);
    return result;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

// Send template email
const sendTemplateEmail = async (to, templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }
  
  const { subject, html } = template(data.name, data.url);
  return await sendEmail(to, subject, html);
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  emailTemplates
};
