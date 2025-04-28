const express = require('express');
const router = express.Router();
const { sendEmail } = require('../email/emailService'); 

router.post('/sendEmail', async (req, res) => {
  const mailOptions = {
    from: `"senter" <test@gmail.com>`,
    to: 'yakormudth@gmail.com',
    subject: 'subject',
    html: '<p style="color:black;">test message</p>',
  };

  try {
    const info = await sendEmail(mailOptions);
    res.status(200).send('email sent: ' + info.response);
  } catch (err) {
    console.error('email error:', err);
    res.status(500).send('Failed to send email.');
  }
});

module.exports = router;
