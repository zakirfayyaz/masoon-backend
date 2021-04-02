const nodemailer = require('nodemailer');

const sendEmailByAdmin = async (mailOptions) => {

  let transporter = nodemailer.createTransport({
    host: "mail.masoon-app.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
  });

  // mail options

  // send mail
  transporter.sendMail(mailOptions, (err, data) => {
    if (err) {
      console.log('error occured');
    }
    else {
      console.log("mail sent!!!")
    }
  });
}
module.exports = sendEmailByAdmin