const nodemailer = require('nodemailer');
const asyncHandler = require("../middleware/async");


exports.sendEmail = asyncHandler(async (req, res, next) => {

    let transporter = nodemailer.createTransport({
        host: "mail.masoon-app.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
    let mailOptions = {
        from: 'sheikhhamzah095@gmail.com',
        to: 'aliraheel62@gmail.com',
        subject: 'Testing email',
        text: 'lets see if it works'
    };
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log('error occured');
        }
        else {
            console.log("mail sent!!!")
        }
    });
});