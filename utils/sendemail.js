const nodemailer = require("nodemailer");

// .env मधले SMTP details वापरून email पाठवणारा helper.
// (Hostinger email साठी: host smtp.hostinger.com, port 465 SSL.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT) === 465, // 465 => SSL true, 587 => false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
   tls: {
    rejectUnauthorized: false,
  },
});

/**
 * एक email पाठवतो.
 * @param {Object} opts
 * @param {string} opts.to      - प्राप्तकर्ता email
 * @param {string} opts.subject - विषय
 * @param {string} opts.html    - email चा मजकूर (HTML)
 */
async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: `"BoardVala" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return info;
}

module.exports = sendEmail;