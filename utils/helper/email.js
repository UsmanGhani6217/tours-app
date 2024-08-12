const nodemailer = require('nodemailer');

const sendEmail = async options => {
    
  // 1- Create a Transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use the correct email service here
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2- Define the email option
  const mailOptions = {
    from: 'Usman Ghani <hello@jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<p>${options.message}</p>`, // Use the provided message from options
  };

  // 3- Actual send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
