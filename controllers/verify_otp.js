const config = require('../config/config');
// twilio client
// const client = require('twilio')(config.accountSID, config.authToken);
const asyncHandler = require("../middleware/async");


const User = require('../models/users_model');

const Nexmo = require('nexmo');

const nexmo = new Nexmo({
    apiKey: 'bb6949c2',
    apiSecret: 'k3QkwMMooT6Jm6IW',
});


// otp via twilio

// exports.send_otp =asyncHandler(async  (req,res,next)=> {

//     const id = req.user.id

//     const user = await User.findOne({ _id: id });
//     const phone_number = user.phone_number
//     // console.log(phone_number);

//     client.verify.services(config.serviceID)
//     .verifications
//     .create({to: '+923049006895', channel: 'sms'})
//     .then(verification => res.status(200).json({status: verification.status}));
// })

// exports.verify_otp =asyncHandler(async (req,res,next) => {

//     const id = req.user.id
//     const user = await User.findOne({ _id: id });
//     const phone_number = user.phone_number
//     console.log(phone_number);

//     client.verify.services(config.serviceID)
//       .verificationChecks
//       .create({to: "+923049006895", code: req.body.code})
//       .then(verification_check => res.status(200).json({status: verification_check.status}));
// })

exports.send_otp = asyncHandler(async (req, res, next) => {

    const id = req.user.id

    const user = await User.findOne({ _id: id });
    const phone_number = user.phone_number
    // console.log(phone_number);
    const result_otp = nexmo.verify.request({
        number: '923161602776',
        brand: 'Masoon',
        code_length: '6'
    }, (err, result) => {
        if (err) {
            res.status(200).json({
                err: err
            })
        }
        else {
            res.status(200).json({
                result
            })
        }
    });
})

exports.verify_otp = asyncHandler(async (req, res, next) => {

    const id = req.user.id
    const user = await User.findOne({ _id: id });
    const phone_number = user.phone_number

    let { request_id , code } = req.body
    nexmo.verify.check({
        request_id: request_id, 
        code: code
    }, (err, result) => {
        if (err) {
            res.status(200).json({
                err: err
            })
        }
        else {
            res.status(200).json({
                result
            })
        }
    });
})