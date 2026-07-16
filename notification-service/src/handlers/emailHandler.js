const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  // Use Ethereal for development (fake SMTP)
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER || process.env.SMTP_USER === 'noreply@shopnest.com') {
    logger.info('Using Ethereal test email account');
    return null; // Will create on-demand
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

let transporter = createTransporter();

const getTestTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

/**
 * Send email
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    let t = transporter;
    if (!t) t = await getTestTransporter();

    const info = await t.sendMail({
      from: `"ShopNest" <${process.env.SMTP_USER || 'noreply@shopnest.com'}>`,
      to,
      subject,
      html,
    });

    // Log preview URL for Ethereal
    if (nodemailer.getTestMessageUrl(info)) {
      logger.info(`📧 Preview email: ${nodemailer.getTestMessageUrl(info)}`);
    }

    logger.info(`✅ Email sent to ${to}: ${subject}`);
    return info;
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail };