const nodemailer = require('nodemailer');
const fs = require('fs');

async function sendInvoiceEmail({ to, subject, text, filePath }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // ⛔ ignoriert selbstsignierte Zertifikate (nur für Tests)
    }
  });

  await transporter.sendMail({
    from: `"Christbaum-Shop" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename: 'rechnung.pdf',
        content: fs.createReadStream(filePath),
      },
    ],
  });
}

module.exports = sendInvoiceEmail;
