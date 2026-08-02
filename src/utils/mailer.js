const nodemailer = require('nodemailer');

// Uses Gmail with an App Password (not your normal Gmail password).
// Set these in your .env file:
//   EMAIL_USER=youraddress@gmail.com
//   EMAIL_PASS=your16characterapppassword
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Bus Reservation System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>Use the code below to reset your password. This code expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background:#ececec; padding: 15px; text-align:center; border-radius:8px;">
          ${otp}
        </div>
        <p style="color:#555; margin-top:20px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };