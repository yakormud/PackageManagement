const nodemailer = require('nodemailer');


// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'oojrstudiooo@gmail.com',
//     pass: ''
//   }
// });

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'patrick.mcglynn@ethereal.email',
      pass: 'u21U5bXBSqBaudej24'
  }
});

// Main send function
const sendEmail = async (options) => {
  return transporter.sendMail(options);
};

module.exports = { sendEmail };
