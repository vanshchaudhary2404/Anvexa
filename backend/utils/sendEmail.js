const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (to, subject, text) => {
  const hasEmailConfig = Boolean(process.env.GMAIL_USER && process.env.GMAIL_PASS);

  if (!hasEmailConfig) {
    console.warn('Email sending skipped: Gmail credentials are not configured.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;