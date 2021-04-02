const Rating = require('../models/Ratings');
const UserEmail = require('../models/User_email');
const User = require('../models/users_model')
const asyncHandler = require("../middleware/async");
const Notification = require('../models/Notifications');
const nodemailer = require('nodemailer');
const decrypt = require('../middleware/GenerateRSAKeys');
const encrypt = require('../middleware/GenerateAESKeys');
const sendEmailByAdmin = require("../middleware/mails");

exports.saveRating = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let { rating, message } = cred

        let rating_ = Number(rating)
        // console.log(req.body)ating_))
        if (rating_ == null || rating_ == undefined || !rating_) {
            let resp = {
                status: 200,
                message: 'Error while saving rating',
                armessage: 'خطأ أثناء حفظ التصنيف'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            const date = new Date();
            let time = date.getTime();
            let check_if_rating_exists = await Rating.find({ user_id: req.user.id });
            if (check_if_rating_exists.length > 0) {
                const user_rating = await Rating.findByIdAndUpdate({ _id: check_if_rating_exists[0].id }, {
                    user_id: req.user.id,
                    rating: rating_,
                    time,
                    message,
                    name: req.user.firstname + ' ' + req.user.lastname,
                    email: req.user.email
                });
                let resp = {
                    status: 200,
                    message: 'Rating updated successfully',
                    armessage: 'تم تحديث التقييم بنجاح',
                    rating: user_rating
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            } else {

                const user_rating = await Rating.create({
                    user_id: req.user.id,
                    rating: rating_,
                    time,
                    message,
                    name: req.user.firstname + ' ' + req.user.lastname,
                    email: req.user.email
                });

                let resp = {
                    status: 200,
                    rating: user_rating
                }
                res.status(200).json({
                    resp: encrypt(JSON.stringify(resp))
                })
            }
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while processing',
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getRatings = asyncHandler(async (req, res, next) => {
    try {
        const user_rating = await Rating.find();
        const one_star = user_rating.filter((m) => m.rating == 1);
        const two_star = user_rating.filter((m) => m.rating == 2);
        const three_star = user_rating.filter((m) => m.rating == 3);
        const four_star = user_rating.filter((m) => m.rating == 4);
        const five_star = user_rating.filter((m) => m.rating == 5);
        let total = 0;
        const total_of_all = user_rating.filter((m) => {
            if (!(m.rating == null || m.rating == undefined)) {
                total = total + m.rating
            }
        })
        var average = 0;
        if (total !== 0) {
            average = total / user_rating.length
        }

        let resp = {
            status: 200,
            total,
            average: average,
            total_ratings: user_rating.length,
            one_star_total: one_star.length,
            one_star,
            two_star_total: two_star.length,
            two_star,
            three_star_total: three_star.length,
            three_star,
            four_star_total: four_star.length,
            four_star,
            five_star_total: five_star.length,
            five_star,
            collective_feedback: user_rating
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.contactUs = asyncHandler(async (req, res, next) => {
    try {
        let { message } = req.body
        if (message == null || message == undefined || !message) {
            res.status(200).json({
                status: 400,
                message: 'Error while sending message',
                armessage: 'خطأ أثناء إرسال الرسالة'
            })
        } else {
            const userEmails = await UserEmail.create({
                user_id: req.user.id,
                name: req.user.firstname + ' ' + req.user.lastname,
                email: req.user.email,
                message: message,
                reply: ''
            });
            // Send  notification to admin
            const admin = await User.findOne({ roll: 'Admin' });
            const notification = await Notification.create({
                user_id: admin.id,
                body: "new message from user",
                subject: "Contact Us mail",
                email: req.user.email
            });
            let mailOptions = {
                from: req.user.email,
                to: process.env.EMAIL,
                subject: 'Masoon User contact',
                text: message
            };
            sendEmailByAdmin(mailOptions)
            res.status(200).json({
                status: 200,
                message: 'mail sent',
                armessage: 'تم إرسال البريد',
                userEmails
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while sending message",
            armessage: 'خطأ أثناء إرسال الرسالة'
        })
    }
});
exports.replyContact = asyncHandler(async (req, res, next) => {
    try {
        let { mail_id, message } = req.body
        if (mail_id == null || mail_id == undefined || mail_id == '') {
            res.status(200).json({
                status: 400,
                message: 'Error while replying',
                armessage: 'خطأ أثناء الرد'
            })
        } else if (message == null || message == undefined || message == '') {
            res.status(200).json({
                status: 200,
                message: 'Error while replying',
                armessage: 'خطأ أثناء الرد'
            })
        } else {
            const userEmails = await UserEmail.findByIdAndUpdate(
                { _id: mail_id },
                { reply: message },
                { new: true, useFindAndModify: false }
            );

            const user = await User.findById({ _id: userEmails.user_id });
            const notification = await Notification.create({
                user_id: userEmails.user_id,
                body: message,
                subject: userEmails.message,
                email: userEmails.email
            });
            // Send  mail to admin
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
            let mailOptions = {
                from: process.env.EMAIL,
                to: userEmails.email,
                subject: 'Masoon User contact',
                text: message
            };
            // send mail
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    console.log(err.message);
                }
                else {
                    console.log("mail sent!!!")
                }
            });
            res.status(200).json({
                status: 200,
                message: 'mail sent',
                armessage: 'تم إرسال البريد',
                userEmails
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while replying',
            armessage: 'خطأ أثناء الرد'
        })
    }
});
exports.viewContactUs = asyncHandler(async (req, res, next) => {
    try {
        const userEmail = await UserEmail.find();
        res.status(200).json({
            status: 200,
            userEmail
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        })
    }
});

