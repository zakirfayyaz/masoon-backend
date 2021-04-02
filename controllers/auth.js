const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/users_model");
const Logger = require("../models/Logger");
const nodemailer = require('nodemailer');
const fs = require('fs');
const bcrypt = require("bcryptjs");
const { numberToArabic } = require('number-to-arabic');
const encrypt = require('../middleware/GenerateAESKeys');
const decrypt = require('../middleware/GenerateRSAKeys');
const crypto = require('crypto');
const axios = require("axios")
const Cashflow = require('../models/Cashflow.js');
const checkEmpty = require('../middleware/validation');
const sendEmailByAdmin = require("../middleware/mails");
const { emailAlert, arEmailAlert } = require("./templates/enMail");


exports.register = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  let cred = decrypt(name);
  let credentials = JSON.parse(cred);
  let users_fromDB = await User.find();

  var { firstname, lastname, email, password, confirmPassword, phone_number, roll } = credentials;
  try {
    if (phone_number == null || phone_number == '' || phone_number == undefined) {
      let json_ = {
        status: 400,
        message: 'Please provide your Phone Number',
        armessage: `يرجى ادخال رقم هاتفك`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (firstname == null || firstname == '' || firstname == undefined) {
      let json_ = {
        status: 400,
        message: 'Please provide your First Name',
        armessage: `يرجى ادخال اسمك الأول`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (lastname == null || lastname == '' || lastname == undefined) {
      let json_ = {
        status: 400,
        message: 'Please provide your Last Name',
        armessage: `يرجى ادخال اسمك الأخير`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (email == null || email == '' || email == undefined) {
      let json_ = {
        status: 400,
        message: 'Please provide your Email',
        armessage: `يرجى ادخال بريدك الإلكتروني`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (password == null || password == '' || password == undefined) {
      let json_ = {
        status: 400,
        message: 'Please provide your Password',
        armessage: `يرجى ادخال كلمة المرور`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (confirmPassword == null || confirmPassword == '' || confirmPassword == undefined) {
      let json_ = {
        status: 400,
        message: 'Please confirm your Password',
        armessage: `يرجى التأكد من صحة كلمة المرور `
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else if (!(password === confirmPassword)) {
      let json_ = {
        status: 400,
        message: `Password don't match`,
        armessage: `كلمة المرور غير مطابقة`
      }
      let resp = JSON.stringify(json_)
      return res.status(200).json({
        resp: encrypt(resp)
      });
    } else {
      const email_check = await User.find({ email: email });
      const phone_check = await User.find({ phone_number: phone_number });
      if (email_check.length > 0) {
        let json_ = {
          status: 400,
          message: 'User already registered with this email',
          armessage: `تم تسجيل المستخدم مُسبقا بهذا البريد الإلكتروني`
        }
        let resp = JSON.stringify(json_)
        return res.status(200).json({
          resp: encrypt(resp)
        });
      }
      else if (phone_check.length > 0) {
        let json_ = {
          status: 400,
          message: 'User already registered with this phone number',
          armessage: `تم تسجيل المستخدم مُسبقا برقم الهاتف هذا`
        }
        let resp = JSON.stringify(json_)
        return res.status(200).json({
          resp: encrypt(resp)
        });
      } else {
        if (roll == null || roll == '' || roll == undefined) {
          const user = await User.create({
            firstname,
            lastname,
            email,
            password,
            phone_number,
            status: 'Pending'
          });
          let url = process.env.MASOON_LINK + `/confirmation/${user.id}`
          let enMEssage = `Welcome to Masoon!\nPlease click on this link to verify your acount ${url}`;
          let enSubject = 'Masoon'
          let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: enSubject,
            html: emailAlert(user.firstname + ' ' + user.lastname, enMEssage, enSubject),
          };
          sendEmailByAdmin(mailOptions)
          let json_ = {
            status: 200,
            message: 'User registered successfully',
            armessage: `تم تسجيل المستخدم بنجاح`
          }
          let resp = JSON.stringify(json_)
          return res.status(200).json({
            resp: encrypt(resp)
          });
        }
        else if (roll === 'Publisher') {
          const user = await User.create({
            firstname,
            lastname,
            email,
            password,
            roll,
            phone_number,
            status: 'Pending'
          });
          let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Masoon Account Credentials',
            text: `You can login to masoon using email: ${email} and password: ${password}`,
            html: returnHtmlAdvMail(email, password)
          };
          sendEmailByAdmin(mailOptions)
          let json_ = {
            status: 200,
            message: 'User registered successfully',
            armessage: 'تم تسجيل المستخدم بنجاح'
          }
          let resp = JSON.stringify(json_)
          return res.status(200).json({
            resp: encrypt(resp)
          });
        }
      }
    }
  } catch (err) {
    next(err);
    let json_ = {
      status: 400,
      message: 'Error while registeration',
      armessage: 'خطأ أثناء التسجيل'
    }
    let resp = JSON.stringify(json_)
    return res.status(200).json({
      resp: encrypt(resp)
    });
  }
});
exports.login = asyncHandler(async (req, res, next) => {
  var otp = Math.floor(100000 + Math.random() * 900000);
  otp = parseInt(otp);
  const { name } = req.body;
  console.log(name);
  let cred = decrypt(name);
  let credentials = JSON.parse(cred);
  console.log(credentials)
  const { email, password, status, playerId } = credentials;

  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  let check = re.test(email);
  if (check == false) {
    let json_ = {
      success: false,
      error: "invalid Email format",
      armessage: `صيغة بريد إلكتروني غير صحيحة`
    }
    let resp = JSON.stringify(json_)
    return res.status(401).json({
      resp: encrypt(resp)
    });
  } else {
    if (email == null || email == '' || email == undefined || password == null || password == undefined || password == " " || status == null || status == undefined || status == " ") {
      let json_ = {
        success: false,
        error: "Please fill all required fields",
        armessage: `يرجى تعبئة جميع الحقول المطلوبة`
      }
      let resp = JSON.stringify(json_)
      return res.status(401).json({
        resp: encrypt(resp)
      });
    } else {
      const user = await User.findOne({ email }).select("+password");
      if (user) {
        if (user.password == null || user.password == undefined || user.password == " ") {
          let json_ = {
            success: false,
            error: "Invalid credentials",
            armessage: 'بيانات الاعتماد غير صحيحة'
          }
          let resp = JSON.stringify(json_)
          return res.status(401).json({
            resp: encrypt(resp)
          });
        } else {
          let isMatch = await user.matchPassword(password);
          if (!isMatch) {
            let json_ = {
              success: false,
              error: "Invalid credentials",
              armessage: 'بيانات الاعتماد غير صحيحة'
            }
            let resp = JSON.stringify(json_)
            return res.status(401).json({
              resp: encrypt(resp)
            });
          } else {
            if (status == 1) {
              if (user.roll == "Admin") {
                otpEmail(email, otp);
                sendTokenResponse(user, 200, res);
                console.log("OTP sent on email only")
              } else if (user.roll == "Publisher") {
                console.log("Publisher found")
                if (!(user.phone_number == null || user.phone_number == undefined || user.phone_number == " ")) {
                  if (!(playerId == undefined || playerId == null || playerId == " ")) {
                    if (user.playerId == "disabled") {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: "disabled" }, { new: true, useFindAndModify: false });
                    } else if (user.playerId == null) {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    } else {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    }
                    let otpResp = await otpMobile(user.phone_number, otp);
                    otpEmail(user.email, otp);
                    sendTokenResponse(user, 200, res);
                    console.log("OTP sent on phone numbe and email")
                  } else {
                    let otpResp = await otpMobile(user.phone_number, otp);
                    otpEmail(user.email, otp);
                    sendTokenResponse(user, 200, res);
                    console.log("OTP sent on phone number and email")
                  }
                } else {
                  if (!(playerId == undefined || playerId == null || playerId == " ")) {
                    if (user.playerId == "disabled") {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: "disabled" }, { new: true, useFindAndModify: false });
                    } else if (user.playerId == null) {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    } else {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    }
                    let otpResp = await otpMobile(user.phone_number, otp);
                    otpEmail(user.email, otp);
                    sendTokenResponse(user, 200, res);
                    console.log("OTP sent on phone number and email")
                  } else {
                    otpEmail(email, otp);
                    sendTokenResponse(user, 200, res);
                    console.log("OTP sent on email only")
                  }
                }
              } else {
                let json_ = {
                  success: false,
                  error: "Invalid credentials",
                  armessage: 'بيانات الاعتماد غير صحيحة'
                }
                let resp = JSON.stringify(json_)
                return res.status(401).json({
                  resp: encrypt(resp)
                });
              }
            } else if (status == 2) {
              if (user.roll == "User") {
                if (user.status == "Pending") {
                  let url = process.env.MASOON_LINK + `/confirmation/${user.id}`;
                  let enMEssage = `Welcome to Masoon!\nPlease click on this link to verify your acount ${url}`;
                  let enSubject = 'Masoon'
                  let mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: enSubject,
                    html: emailAlert(user.firstname + ' ' + user.lastname, enMEssage, enSubject),
                  };
                  sendEmailByAdmin(mailOptions)
                  let json_ = {
                    success: false,
                    error: "Please verify your account first.\nWe have sent a verification link to this Email: " + user.email,
                    armessage: 'يرجى التحقق من حسابك أولا\nلقد أرسلنا رابط التحقق إلى هذا البريد الإلكتروني ' + user.email
                  }
                  let resp = JSON.stringify(json_)
                  return res.status(200).json({
                    resp: encrypt(resp)
                  });
                } else if (user.status == "Blocked") {
                  let json_ = {
                    success: false,
                    error: "Your account is disabled by Masoon",
                    armessage: `تم تعطيل حسابك بواسطة إدارة التطبيق`
                  }
                  let resp = JSON.stringify(json_)
                  return res.status(401).json({
                    resp: encrypt(resp)
                  });
                } else {
                  if (playerId == undefined || playerId == null || playerId == " ") {
                    let json_ = {
                      success: false,
                      error: "Please fill all required fields",
                      armessage: `يرجى تعبئة جميع الحقول المطلوبة`
                    }
                    let resp = JSON.stringify(json_)
                    return res.status(401).json({
                      resp: encrypt(resp)
                    });
                  } else {
                    if (user.playerId == "disabled") {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: "disabled" }, { new: true, useFindAndModify: false });
                    } else if (user.playerId == null) {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    } else {
                      const user_ = await User.findByIdAndUpdate({ _id: user.id }, { playerId: playerId }, { new: true, useFindAndModify: false });
                    }
                    if (!(user.phone_number == null || user.phone_number == undefined || user.phone_number == " ")) {
                      let otpResp = await otpMobile(user.phone_number, otp);
                      otpEmail(user.email, otp);
                      sendTokenResponse(user, 200, res);
                      console.log("OTP sent on phone numbe and email")
                    } else {
                      otpEmail(email, otp);
                      sendTokenResponse(user, 200, res);
                      console.log("OTP sent on email only")
                    }
                  }
                }
              } else {
                let json_ = {
                  success: false,
                  error: "Invalid credentials",
                  armessage: 'بيانات الاعتماد غير صحيحة'
                }
                let resp = JSON.stringify(json_)
                return res.status(401).json({
                  resp: encrypt(resp)
                });
              }
            } else {
              let json_ = {
                success: false,
                error: "An Error occured while logging in please try again later",
                armessage: `حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى`
              }
              let resp = JSON.stringify(json_)
              return res.status(401).json({
                resp: encrypt(resp)
              });
            }
          }
        }
      } else {
        let json_ = {
          success: false,
          error: "Invalid credentials",
          armessage: 'بيانات الاعتماد غير صحيحة'
        }
        let resp = JSON.stringify(json_)
        return res.status(401).json({
          resp: encrypt(resp)
        });
      }
    }

  }
});
const otpMobile = async (phone, otp) => {
  try {
    const user = await User.find({ phone_number: phone });
    // var otp = Math.floor(100000 + Math.random() * 900000);
    // otp = parseInt(otp);
    console.log("MOBILE OTP", otp);
    if (user[0].language == 'ar') {
      let message = `MASOON: Your verification code is ${otp}`
      let url = `http://www.hisms.ws/api.php?send_sms&username=966504405818&password=3Aki9BdsvAfb@xX&numbers=${phone}&sender=MASOON&message=${message}`
      let resp = await axios.get(url)
      let resp_code = resp.data.split('-');
      if (resp_code[0] == "3") {
        const newDate = new Date();
        const update_user = await User.findByIdAndUpdate({ _id: user[0].id },
          { otp: otp, otp_expires: new Date(newDate.getTime() + 3 * 60000) },
          { new: true, useFindAndModify: false });
        return 1;
      } else {
        return 2;
      }
    } else {
      let message = `MASOON: Your verification code is ${otp}`
      let url = `http://www.hisms.ws/api.php?send_sms&username=966504405818&password=3Aki9BdsvAfb@xX&numbers=${phone}&sender=MASOON&message=${message}`
      let resp = await axios.get(url)
      let resp_code = resp.data.split('-');
      if (resp_code[0] == "3") {
        const newDate = new Date();
        const update_user = await User.findByIdAndUpdate({ _id: user[0].id },
          { otp: otp, otp_expires: new Date(newDate.getTime() + 3 * 60000) },
          { new: true, useFindAndModify: false });
        return 1;
      } else {
        return 2;
      }
    }
  } catch (err) {
    console.log(err);
  }
};
const otpEmail = async (email, otp) => {
  try {
    console.log("worked");
    const user = await User.find({ email: email });
    // var otp = Math.floor(100000 + Math.random() * 900000);
    // otp = parseInt(otp);
    console.log("EMAIL OTP", otp);

    if (user[0].language == 'ar') {
      let new_otp = numberToArabic(otp);
      // console.log(otp);
      const newDate = new Date();
      const update_user = await User.findByIdAndUpdate({ _id: user[0].id },
        { otp: otp, otp_expires: new Date(newDate.getTime() + 3 * 60000) },
        { new: true, useFindAndModify: false });

      let transporter = nodemailer.createTransport({
        host: "mail.masoon-app.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      });
      let arMessage = `رمز التفعيل الخاص بك هو:${new_otp} `
      let arSubject = `رمز التفعيل الخاص بك هو:${new_otp} `
      let mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: arSubject,
        html: arEmailAlert(user[0].firstname + ' ' + user[0].lastname, arMessage, arSubject),
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

    } else {

      // console.log(otp);
      const newDate = new Date();
      const update_user = await User.findByIdAndUpdate({ _id: user[0].id },
        { otp: otp, otp_expires: new Date(newDate.getTime() + 3 * 60000) },
        { new: true, useFindAndModify: false });

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
        from: process.env.EMAIL,
        to: email,
        subject: `Your code is: ${otp}`,
        html: emailAlert(user[0].firstname + ' ' + user[0].lastname, `Your code is: ${otp}`, `Your code is: ${otp}`),
      };

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
  } catch (err) {
    console.log(err);
  }
}
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const cashflow = await Cashflow.find();
  let cash_f = "false";
  // if (cashflow[0].enabled == "true") {
  //   cash_f = "true"
  // }
  const token = user.getSignedJwtToken();
  console.log(token)

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  const date = new Date();
  let current_time = date.getTime();
  // console.log(user.roll);
  if (user.roll !== 'Admin') {
    const logger = await Logger.create({
      user_id: user.id,
      username: user.firstname + " " + user.lastname,
      roll: user.roll,
      user_email: user.email,
      time: current_time
    });
  }

  if (user.phone_number == undefined || user.phone_number == null || !user.phone_number) {
    let json_ = {
      success: {
        token: token,
        type: user.roll,
        user_name: user.firstname,
        user_id: user.id,
        lang: user.language,
        active: user.active,
        cash_f
      },
      status: user.status
    }
    let jsonStr = JSON.stringify(json_);
    // console.log(jsonStr)
    res.status(statusCode).cookie("token", token, options).json({ resp: encrypt(jsonStr) });
  } else {
    if (user.profile_image == undefined || user.profile_image == null || !user.profile_image) {
      let json_ = {
        success: {
          token: token,
          type: user.roll,
          user_name: user.firstname,
          user_id: user.id,
          lang: user.language,
          active: user.active,
          cash_f
        },
        status: user.status
      }
      let jsonStr = JSON.stringify(json_);
      // console.log(jsonStr)
      res.status(statusCode).cookie("token", token, options).json({ resp: encrypt(jsonStr) });
    } else {
      let json_ = {
        success: {
          token: token,
          type: user.roll,
          user_name: user.firstname,
          user_id: user.id,
          lang: user.language,
          profile_image: user.profile_image,
          phone_number: user.phone_number,
          active: user.active,
          cash_f
        },
        status: user.status
      }
      let jsonStr = JSON.stringify(json_);
      // console.log(jsonStr)
      res.status(statusCode).cookie("token", token, options).json({ resp: encrypt(jsonStr) });
    }
  }
};
exports.verifyemailotp = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;
    let cred = decrypt(name);
    let credentials = JSON.parse(cred);
    let otp = credentials;
    const user = await User.findById({ _id: req.user.id });
    if (otp == user.otp) {
      sendTokenResponse(user, 200, res);
    } else {
      let json_ = {
        status: 400,
        message: "OTP does not match",
        armessage: `رمز التفعيل غير مطابق`
      }
      let resp = encrypt(JSON.stringify(json_));
      res.status(200).json({
        resp
      })
    }
  } catch (err) {
    next(err);
  }
});
exports.reSendEmailOtp = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find({ _id: req.user.id });
    otpEmail(user[0].email);
    res.status(200).json({
      status: 200,
      message: "OTP sent successfully",
      armessage: `تم إرسال رمز التفعيل بنجاح`
    })
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while sending OTP",
      armessage: `خطأ أثناء إرسال رمز التفعيل`
    })
  }
});
exports.expireOtp = asyncHandler(async (req, res, next) => {
  try {
    const update_user = await User.findByIdAndUpdate({ _id: req.user.id },
      { otp: false }, { new: true, useFindAndModify: false });
    res.status(200).json({
      status: 200,
      message: 'OTP expired',
      armessage: `انتهت صلاحية ادخال رمز التفعيل`
    })
  } catch (err) {
    next(err);
  }
});
exports.checkIfPasswordExists = async (req, res, next) => {
  if (req.user.password == " " || req.user.password == undefined || req.user.password == null) {
    resp = {
      status: 200,
      password: false
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } else {
    resp = {
      status: 200,
      password: true
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
}
exports.saveNewPasswordForSocialAccount = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let password = cred.password;
    const salt = await bcrypt.genSalt(10);
    let hashed_password = await bcrypt.hash(password, salt);
    let updateUser = await User.findByIdAndUpdate({ _id: req.user.id }, { password: hashed_password }, { new: true, useFindAndModify: false });
    if (updateUser) {
      resp = {
        status: 200,
        message: "Password updated successfully",
        armessage: 'تم تحديث كلمة السر بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      resp = {
        status: 400,
        message: "Error while updating password",
        armessage: 'خطأ أثناء تحديث كلمة المرور'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    resp = {
      status: 400,
      message: "Error while updating password",
      armessage: 'خطأ أثناء تحديث كلمة المرور'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.expireUser = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const user = await User.findByIdAndUpdate({ _id: cred.user_id }, { blocked: true }, { new: true, useFindAndModify: false });
    let resp = {
      status: 200,
      message: 'User deleted successfully',
      armessage: 'تم حذف المستخدم بنجاح'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while deleting user',
      armessage: 'خطأ أثناء حذف المستخدم'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.getMe = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let resp = {
      success: true,
      profile: user
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data",
      armessage: `خطأ أثناء جلب البيانات`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  let { name } = req.body;
  let cred = JSON.parse(decrypt(name));
  const user = await User.findOne({ email: cred.email });

  if (!user) {
    let resp = {
      status: 401,
      message: 'There is no user with that email',
      armessage: 'لا يوجد مستخدم بهذا البريد الإلكتروني'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  // Create reset url
  const resetUrl = `${process.env.MASOON_LINK}/resetpassword/${resetToken}`;
  // const resetUrl = `http://192.168.1.29:3001/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else)
   has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
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
    let url = `${process.env.MASOON_LINK}/confirmation/${user.id}`
    // mail options
    let mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Reset Password',
      text: `Please click this link to reset your password: ${resetUrl}`,
      html: returnHtmlResetPassword(resetUrl)
    };

    // send mail
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log('error occured');
      }
      else {
        console.log("mail sent!!!")
      }
    });

    let resp = {
      success: true,
      data: 'Email sent',
      armessage: `تم ارسال البريد الإلكتروني`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    let resp = {
      message: 'Email could not be sent',
      armessage: 'تعذر إرسال البريد الإلكتروني',
      status: 401
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 200));
  }

  const user_ = await User.findById(user.id).select('+password');
  // console.log(req.body);

  // var { password } = req.body

  const result = await user_.matchPassword(req.body.password);
  if (result == true) {
    res.status(200).json({
      status: 200,
      message: 'Please enter a different password from the last one',
      armessage: 'الرجاء إدخال كلمة مرور مختلفة عن آخر كلمة مرور'
    })
  } else {

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      status: 200,
      message: 'Password changed successfully',
      armessage: 'تم تغيير الرقم السري بنجاح'
    })
  }

  // sendTokenResponse(user, 200, res);
});
exports.updatePassword = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))

    const user = await User.findById(req.user.id).select('+password');
    var { newPassword } = cred
    const result = await user.matchPassword(cred.currentPassword);

    // Check current password
    if (result === false) {
      let resp = {
        status: 401,
        message: 'Incorrect current password',
        armessage: 'كلمة المرور الحالية غير صحيحة'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
    else if (result === true) {
      const salt = await bcrypt.genSalt(10);
      const update_password_of_user = await bcrypt.hash(newPassword, salt, null);
      const user_update = await User.findByIdAndUpdate({ _id: req.user.id }, { password: update_password_of_user }, { new: true, useFindAndModify: false });

      let resp = {
        status: 200,
        message: 'Password updated successfully',
        armessage: 'تم تحديث كلمة السر بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while updating password',
      armessage: 'خطأ أثناء تحديث كلمة المرور'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.getU = asyncHandler(async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const user = await User.findById({ _id: user_id });
    if (user.profile_image !== undefined && user.profile_image) {
      const path = user.profile_image
      if (fs.existsSync(path)) {
        fs.unlink(path, async (err) => {
          if (err) {
            console.error(err)
            return
          }
          else {
            await User.findByIdAndUpdate(
              { _id: user_id },
              { profile_image: req.file.path.replace("\\", "/") },
              { new: true, useFindAndModify: false }).then(async (profile) => {
                await profile
              }).catch((err) => {
                console.log(err)
              })
            let resp = {
              status: 200,
              message: 'File updated',
              armessage: 'تم تحديث الملف بنجاح'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            })
          }
        })
      } else {
        await User.findByIdAndUpdate(
          { _id: user_id },
          { profile_image: req.file.path.replace("\\", "/") },
          { new: true, useFindAndModify: false }).then(async (profile) => {
            await profile
          }).catch((err) => {
            console.log(err)
          })
        let resp = {
          status: 200,
          message: 'File updated',
          armessage: 'تم تحديث الملف بنجاح'
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      }
    }
    else if (user.profile_image === undefined || user.profile_image === null || user.profile_image) {
      const user_ = await User.findByIdAndUpdate(
        { _id: user_id },
        { profile_image: req.file.path.replace("\\", "/") },
        { new: true, useFindAndModify: false });
      let resp = {
        status: 200,
        message: 'File updated',
        armessage: 'تم تحديث الملف بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while updating image',
      armessage: 'خطأ أثناء تحديث الصورة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.editprofile = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let { firstname, lastname } = cred
    const profile = await User.findOne({ _id: req.user.id });
    const update_profile = await User.findByIdAndUpdate(
      { _id: req.user.id },
      { firstname: firstname, lastname: lastname },
      { new: true, useFindAndModify: false });
    let resp = {
      status: 200,
      message: "Profile updated successfully",
      armessage: 'تم تحديث الملف الشخصي بنجاح'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while editing profile",
      armessage: 'خطأ أثناء تحرير الملف الشخصي'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.updateEmail = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let { email } = cred
    const profile = await User.find({ email: email });
    if (profile.length > 0) {
      let resp = {
        status: 400,
        message: "Email already taken, please select another different email",
        armessage: 'البريد الإلكتروني مأخوذ بالفعل ، يرجى تحديد بريد إلكتروني آخر مختلف'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      const update_profile = await User.findByIdAndUpdate({ _id: req.user.id }, { email: email }, { new: true, useFindAndModify: false });
      let resp = {
        status: 200,
        message: "Email updated successfully",
        armessage: 'تم تحديث البريد الإلكتروني بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while updating email",
      armessage: 'خطأ أثناء تحديث البريد الإلكتروني'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.updatePhoneNumber = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let { phone_number } = cred
    const profile = await User.find({ phone_number: phone_number });
    if (profile.length > 0) {
      let resp = {
        status: 400,
        message: "Phone number already exists, please select another different Phone number",
        armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      const update_profile = await User.findByIdAndUpdate({ _id: req.user.id }, { phone_number: phone_number }, { new: true, useFindAndModify: false });
      let resp = {
        status: 200,
        message: "Phone Number updated successfully",
        armessage: 'تم تحديث رقم الهاتف بنجاح'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }

  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while updating phone number",
      armessage: 'خطأ أثناء تحديث رقم الهاتف'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.updateAdvertiser = asyncHandler(async (req, res, next) => {
  try {
    const user_id = req.params.id
    const { firstname, lastname, email, phone_number, language } = req.body

    if (firstname == undefined || lastname == undefined || email == undefined || phone_number == undefined || language == undefined
      || firstname == null || lastname == null || email == null || phone_number == null || language == null
      || firstname == "" || lastname == "" || email == "" || phone_number == "" || language == "") {
      res.status(200).json({
        status: 400,
        message: `Please fill all required fields`,
        armessage: `يرجى تعبئة جميع الحقول المطلوبة`
      })
    } else {
      const findUser = await User.findById({ _id: user_id });
      if (findUser.email == email) {
        if (findUser.phone_number == phone_number) {
          const update_user = await User.findByIdAndUpdate(
            { _id: user_id },
            { firstname: firstname, lastname: lastname, language: language },
            { new: true, useFindAndModify: false })
          res.status(200).json({
            status: 200,
            message: 'Profile Updated',
            armessage: 'تحديث الملف الشخصي'
          })
        } else if (findUser.phone_number != phone_number) {
          const phone_check = await User.find({ phone_number: phone_number });
          if (phone_check.length > 0) {
            res.status(200).json({
              status: 400,
              message: 'Phone number already exists, please select another different Phone number',
              armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
            })
          } else {
            const update_user = await User.findByIdAndUpdate(
              { _id: user_id },
              { phone_number: phone_number, firstname: firstname, lastname: lastname, language: language },
              { new: true, useFindAndModify: false });
            res.status(200).json({
              status: 200,
              message: 'Profile Updated',
              armessage: 'تحديث الملف الشخصي'
            })
          }
        }
      } else if (findUser.email != email) {
        const email_check = await User.find({ email: email });
        if (email_check.length > 0) {
          res.status(200).json({
            status: 400,
            message: 'Email already exists, please choose a different email',
            armessage: `البريد الالكتروني مُستخدم مسبقاً، يرجى اختيار بريد إلكتروني مختلف`
          })
        } else {
          if (findUser.phone_number == phone_number) {
            const update_user = await User.findByIdAndUpdate(
              { _id: user_id },
              { email: email, firstname: firstname, lastname: lastname, language: language },
              { new: true, useFindAndModify: false })
            res.status(200).json({
              status: 200,
              message: 'Profile Updated',
              armessage: 'تحديث الملف الشخصي'
            })
          } else if (findUser.phone_number != phone_number) {
            const phone_check = await User.find({ phone_number: phone_number });
            if (phone_check.length > 0) {
              res.status(200).json({
                status: 400,
                message: 'Phone number already exists, please select another different Phone number',
                armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
              })
            } else {
              const update_user = await User.findByIdAndUpdate(
                { _id: user_id },
                { email: email, phone_number: phone_number, firstname: firstname, lastname: lastname, language: language },
                { new: true, useFindAndModify: false });
              res.status(200).json({
                status: 200,
                message: 'Profile Updated',
                armessage: 'تحديث الملف الشخصي'
              })
            }
          }
        }
      }
    }

  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while editing profile",
      armessage: 'خطأ أثناء تحرير الملف الشخصي'
    })
  }
});
exports.updateAdminProfile = asyncHandler(async (req, res, next) => {
  try {
    let { user_ID } = req.body;
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let id = JSON.parse(decrypt(user_ID));
    const user_id = id.id;
    const { firstname, lastname, email } = cred;

    if (firstname == undefined || lastname == undefined || email == undefined
      || firstname == null || lastname == null || email == null
      || firstname == "" || lastname == "" || email == "") {
      let resp = {
        status: 400,
        message: 'Please fill all required fields',
        armessage: `يرجى تعبئة جميع الحقول المطلوبة`
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      const findUser = await User.findById({ _id: user_id });
      if (findUser.email == email) {
        const updateUser = await User.findByIdAndUpdate(
          { _id: user_id },
          { firstname: firstname, lastname: lastname },
          { new: true, useFindAndModify: false }
        )
        let resp = {
          status: 200,
          message: "Profile updated successfully",
          armessage: 'تم تحديث الملف الشخصي بنجاح'
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      } else if (findUser.email != email) {
        const check_email = await User.find({ email: email });
        if (check_email.length > 0) {
          let resp = {
            status: 400,
            message: "Email already taken, please select another different email",
            armessage: 'البريد الإلكتروني مأخوذ بالفعل ، يرجى تحديد بريد إلكتروني آخر مختلف'
          }
          res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
          })
        } else {
          const updateUser = await User.findByIdAndUpdate(
            { _id: user_id },
            { email: email, firstname: firstname, lastname: lastname },
            { new: true, useFindAndModify: false }
          )
          let resp = {
            status: 200,
            message: "Profile updated successfully",
            armessage: 'تم تحديث الملف الشخصي بنجاح'
          }
          res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
          })
        }
      }
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while editing profile",
      armessage: 'خطأ أثناء تحرير الملف الشخصي'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.emailToLowercase = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.find();
    for (let i = 0; i < user.length; i++) {
      let email = user[i].email.toLowerCase();
      const user_ = await User.findByIdAndUpdate({ _id: user[i].id }, { email: email }, { new: true, useFindAndModify: false });
    }
    return res.status(200).json({
      status: 200,
      message: 'email updated successfully'
    })
  } catch (err) {
    next(err);
  }
});
exports.socialAuth = asyncHandler(async (req, res, next) => {
  try {
    var otp = Math.floor(100000 + Math.random() * 900000);
    otp = parseInt(otp);
    const { social } = req.body;
    let cred = decrypt(social);
    let credentials = JSON.parse(cred);
    let { name, email, playerId } = credentials;
    if (name == null || name == '' || name == undefined ||
      email == null || email == undefined || email == '') {
      res.status(200).json({
        status: 400,
        message: `Please fill all required fields`,
        armessage: `يرجى تعبئة جميع الحقول المطلوبة`
      })
    } else {
      // console.log(req.body);
      const user = await User.find({ email: email });
      if (user.length > 0) {
        if (!(playerId == undefined)) {
          // console.log(user.playerId);
          if (user[0].playerId == "disabled") {
            const user_ = await User.findByIdAndUpdate({ _id: user[0].id }, { playerId: "disabled" }, { new: true, useFindAndModify: false });
          } else if (user[0].playerId == undefined) {
            const user_ = await User.findByIdAndUpdate({ _id: user[0].id }, { playerId: playerId }, { new: true, useFindAndModify: false });
          } else {
            const user_ = await User.findByIdAndUpdate({ _id: user[0].id }, { playerId: playerId }, { new: true, useFindAndModify: false });
          }
        }
        if (!(user[0].phone_number == null || user[0].phone_number == undefined || user[0].phone_number == " ")) {
          let otpResp = await otpMobile(user[0].phone_number, otp);
          otpEmail(user[0].email, otp);
          sendTokenResponse(user[0], 200, res);
          console.log("OTP sent on phone number and email")
        } else {
          otpEmail(email, otp);
          sendTokenResponse(user[0], 200, res);
          console.log("OTP sent on email only")
        }
      } else if (user.length == 0) {
        let split_name = name.split(' ');
        const create_user = await User.create({
          firstname: split_name[0],
          lastname: split_name[1],
          email: email,
          roll: "User",
          status: "Approved",
          playerId,
        });
        otpEmail(email, otp);
        sendTokenResponse(create_user, 200, res);
      }
    }
  } catch (err) {
    next(err);

  }
});
exports.updatePhoneNumberAfterSocialLogin = asyncHandler(async (req, res, next) => {
  try {
    let { phone_number } = req.body
    if (phone_number == null || phone_number == '' || phone_number == undefined) {
      res.status(200).json({
        status: 400,
        message: 'Please provide your Phone Number',
        armessage: `يرجى ادخال رقم هاتفك`
      });
    } else {
      const phone_check = await User.find({ phone_number: phone_number });
      if (phone_check.length > 0) {
        res.status(200).json({
          status: 200,
          message: 'Phone number already exists, please select another different Phone number',
          armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
        });
      } else {
        const user = await User.findByIdAndUpdate({ _id: req.user.id },
          { phone_number: req.body.phone_number },
          { new: true, useFindAndModify: false });
        res.status(200).json({
          status: 200,
          message: 'Phone number updated successfully',
          armessage: 'تم تحديث رقم الهاتف بنجاح'
        });
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while updating phone number",
      armessage: 'خطأ أثناء تحديث رقم الهاتف'
    })
  }
});
const returnHtmlOtp = (otp) => {
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
  
      <!-- CSS Reset : BEGIN -->
      <style>
          /* What it does: Remove spaces around the email design added by some email clients. */
          /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background: #f1f1f1;
          }
  
          /* What it does: Stops email clients resizing small text. */
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
  
          /* What it does: Centers email on Android 4.4 */
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
  
          /* What it does: Stops Outlook from adding extra spacing to tables. */
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
          }
  
          /* What it does: Fixes webkit padding issue. */
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
  
          /* What it does: Uses a better rendering method when resizing images in IE. */
          img {
              -ms-interpolation-mode: bicubic;
          }
  
          /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
          a {
              text-decoration: none;
          }
  
          /* What it does: A work-around for email clients meddling in triggered links. */
          *[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
  
          /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
  
          /* What it does: Prevents Gmail from changing the text color in conversation threads. */
          .im {
              color: inherit !important;
          }
  
          /* If the above doesn't work, add a .g-img class to any image in question. */
          img.g-img+div {
              display: none !important;
          }
  
          /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
          /* Create one of these media queries for each additional viewport size you'd like to fix */
  
          /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
              }
          }
  
          /* iPhone 6, 6S, 7, 8, and X */
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
              }
          }
  
          /* iPhone 6+, 7+, and 8+ */
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
              }
          }
      </style>
  
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
          .primary {
              background: #30e3ca;
          }
  
          .bg_white {
              background: #ffffff;
          }
  
          .bg_light {
              background: #fafafa;
          }
  
          .bg_black {
              background: #000000;
          }
  
          .bg_dark {
              background: rgba(0, 0, 0, .8);
          }
  
          .email-section {
              padding: 2.5em;
          }
  
          /*BUTTON*/
          .btn {
              padding: 10px 15px;
              display: inline-block;
          }
  
          .btn.btn-primary {
              border-radius: 5px;
              background: #30e3ca;
              color: #ffffff;
          }
  
          .btn.btn-white {
              border-radius: 5px;
              background: #ffffff;
              color: #000000;
          }
  
          .btn.btn-white-outline {
              border-radius: 5px;
              background: transparent;
              border: 1px solid #fff;
              color: #fff;
          }
  
          .btn.btn-black-outline {
              border-radius: 0px;
              background: transparent;
              border: 2px solid #000;
              color: #000;
              font-weight: 700;
          }
  
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              font-family: 'Lato', sans-serif;
              color: #000000;
              margin-top: 0;
              font-weight: 400;
          }
  
          body {
              font-family: 'Lato', sans-serif;
              font-weight: 400;
              font-size: 15px;
              line-height: 1.8;
              color: rgba(0, 0, 0, .4);
          }
  
          a {
              color: #30e3ca;
          }
  
          table {}
  
          /*LOGO*/
  
          .logo h1 {
              margin: 0;
          }
  
          .logo h1 a {
              color: #5c1ac3;
              font-size: 24px;
              font-weight: 700;
              font-family: 'Lato', sans-serif;
          }
  
          /*HERO*/
          .hero {
              position: relative;
              z-index: 0;
          }
  
          .hero .text {
              color: rgba(0, 0, 0, .3);
          }
  
          .hero .text h2 {
              color: #000;
              font-size: 40px;
              margin-bottom: 0;
              font-weight: 400;
              line-height: 1.4;
          }
  
          .hero .text h3 {
              font-size: 24px;
              font-weight: 300;
          }
  
          .hero .text h2 span {
              font-weight: 600;
              color: #5c1ac3;
          }
  
  
          /*HEADING SECTION*/
          .heading-section {}
  
          .heading-section h2 {
              color: #000000;
              font-size: 28px;
              margin-top: 0;
              line-height: 1.4;
              font-weight: 400;
          }
  
          .heading-section .subheading {
              margin-bottom: 20px !important;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(0, 0, 0, .4);
              position: relative;
          }
  
          .heading-section .subheading::after {
              position: absolute;
              left: 0;
              right: 0;
              bottom: -10px;
              content: '';
              width: 100%;
              height: 2px;
              background: #30e3ca;
              margin: 0 auto;
          }
  
          .heading-section-white {
              color: rgba(255, 255, 255, .8);
          }
  
          .heading-section-white h2 {
              font-family:
                  line-height: 1;
              padding-bottom: 0;
          }
  
          .heading-section-white h2 {
              color: #ffffff;
          }
  
          .heading-section-white .subheading {
              margin-bottom: 0;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(255, 255, 255, .4);
          }
  
  
          ul.social {
              padding: 0;
          }
  
          ul.social li {
              display: inline-block;
              margin-right: 10px;
          }
  
          /*FOOTER*/
  
          .footer {
              border-top: 1px solid rgba(0, 0, 0, .05);
              color: rgba(0, 0, 0, .5);
          }
  
          .footer .heading {
              color: #000;
              font-size: 20px;
          }
  
          .footer ul {
              margin: 0;
              padding: 0;
          }
  
          .footer ul li {
              list-style: none;
              margin-bottom: 10px;
          }
  
          .footer ul li a {
              color: rgba(0, 0, 0, 1);
          }
  
  
          @media screen and (max-width: 500px) {}
      </style>
  
  
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
          <div
              style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
          <div style="max-width: 600px; margin: 0 auto;" class="email-container">
              <!-- BEGIN BODY -->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <!-- <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td class="logo" style="text-align: center;">
                                      <h1><a href="http://masoon.cdoxs.com">Masoon</a></h1>
                                  </td>
                              </tr>
                          </table>
                      </td> -->
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                            <h1 style="text-align: center;margin-bottom:0px; font-weight: 600; color:rgb(207, 101, 181);font-size: 35px;">Masoon</h1>
                              <h3 style="text-align: center;">Better control of your budget</h3>
                          </td>
  
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                          <table>
                              <tr>
                                  <td>
                                      <div class="text" style="padding: 0 2.5em; text-align: center;">
                                          <h2>Your Code is : ${otp}</h2>
                                          <div class="mt-5" style="text-align: left">
                                              <b>
                                                  <div class="mt-3" class="text-dark">
                                                      The Code will be active for 3 minutes. If you don't enter it on the
                                                      Masoon
                                                      OTP Verification
                                                      page it will be expired ,you can resend it.
                                                  </div>
                                                  <div class="mt-3" class="text-dark">
                                                      If you don't recognize or expect this email , you can always report
                                                      suspicious behaviour to
                                                      our team support.
                                                  </div>
                                                  <div class="mt-4" class="text-dark">
                                                      <h3>
                                                          The Masoon Team
                                                      </h3>
                                                  </div>
                                              </b>
                                          </div>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end tr -->
                  <!-- 1 Column Text + Button : END -->
              </table>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <td valign="middle" class="bg_light footer email-section">
                          <table>
                              <tr>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-right: 10px;">
                                                  <h3 class="heading">About</h3>
                                                  <p>Masoon is an online budget planner which takes charge of your finances.
                                                  A free budget tracker that helps you understand your spendings for a brighter financial future. </p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 5px; padding-right: 5px;">
                                                  <h3 class="heading">Contact Info</h3>
                                                  <ul>
                                                      <li><span class="text">203 Lake St. Mountain View, Saudia Arabia,
                                                          </span></li>
                                                      <li><span class="text">+966 392 3929 210</span></a></li>
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 10px;">
                                                  <h3 class="heading">Social Links</h3>
                                                  <ul>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/color/32/000000/facebook-circled--v2.png" /></a>
                                                      </li>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/fluent/32/000000/instagram-new.png" /></a>
                                                      </li>
  
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end: tr -->
                  <!-- <tr>
                      <td class="bg_light" style="text-align: center;">
                          <p>No longer want to receive these email? You can <a href="#"
                                  style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                      </td>
                  </tr> -->
              </table>
  
          </div>
      </center>
  </body>
  
  </html>`
}
const returnHtmlEmailVerification = (link) => {
  return `
  <img class="img-fluid" src="https://i.ibb.co/Sd3wpBb/masoonlogo.png" alt=""
                              style="width: 175px; max-width: 600px; height: auto; margin: auto; display: block;">
                      <!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
  
      <!-- CSS Reset : BEGIN -->
      <style>
          /* What it does: Remove spaces around the email design added by some email clients. */
          /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background: #f1f1f1;
          }
  
          /* What it does: Stops email clients resizing small text. */
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
  
          /* What it does: Centers email on Android 4.4 */
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
  
          /* What it does: Stops Outlook from adding extra spacing to tables. */
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
          }
  
          /* What it does: Fixes webkit padding issue. */
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
  
          /* What it does: Uses a better rendering method when resizing images in IE. */
          img {
              -ms-interpolation-mode: bicubic;
          }
  
          /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
          a {
              text-decoration: none;
          }
  
          /* What it does: A work-around for email clients meddling in triggered links. */
          *[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
  
          /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
  
          /* What it does: Prevents Gmail from changing the text color in conversation threads. */
          .im {
              color: inherit !important;
          }
  
          /* If the above doesn't work, add a .g-img class to any image in question. */
          img.g-img+div {
              display: none !important;
          }
  
          /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
          /* Create one of these media queries for each additional viewport size you'd like to fix */
  
          /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
              }
          }
  
          /* iPhone 6, 6S, 7, 8, and X */
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
              }
          }
  
          /* iPhone 6+, 7+, and 8+ */
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
              }
          }
      </style>
  
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
          .primary {
              background: #30e3ca;
          }
  
          .bg_white {
              background: #ffffff;
          }
  
          .bg_light {
              background: #fafafa;
          }
  
          .bg_black {
              background: #000000;
          }
  
          .bg_dark {
              background: rgba(0, 0, 0, .8);
          }
  
          .email-section {
              padding: 2.5em;
          }
  
          /*BUTTON*/
          .btn {
              padding: 10px 15px;
              display: inline-block;
          }
  
          .btn.btn-primary {
              border-radius: 5px;
              background: #30e3ca;
              color: #ffffff;
          }
  
          .btn.btn-white {
              border-radius: 5px;
              background: #ffffff;
              color: #000000;
          }
  
          .btn.btn-white-outline {
              border-radius: 5px;
              background: transparent;
              border: 1px solid #fff;
              color: #fff;
          }
  
          .btn.btn-black-outline {
              border-radius: 0px;
              background: transparent;
              border: 2px solid #000;
              color: #000;
              font-weight: 700;
          }
  
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              font-family: 'Lato', sans-serif;
              color: #000000;
              margin-top: 0;
              font-weight: 400;
          }
  
          body {
              font-family: 'Lato', sans-serif;
              font-weight: 400;
              font-size: 15px;
              line-height: 1.8;
              color: rgba(0, 0, 0, .4);
          }
  
          a {
              color: #30e3ca;
          }
  
          table {}
  
          /*LOGO*/
  
          .logo h1 {
              margin: 0;
          }
  
          .logo h1 a {
              color: #5c1ac3;
              font-size: 24px;
              font-weight: 700;
              font-family: 'Lato', sans-serif;
          }
  
          /*HERO*/
          .hero {
              position: relative;
              z-index: 0;
          }
  
          .hero .text {
              color: rgba(0, 0, 0, .3);
          }
  
          .hero .text h2 {
              color: #000;
              font-size: 40px;
              margin-bottom: 0;
              font-weight: 400;
              line-height: 1.4;
          }
  
          .hero .text h3 {
              font-size: 24px;
              font-weight: 300;
          }
  
          .hero .text h2 span {
              font-weight: 600;
              color: #5c1ac3;
          }
  
  
          /*HEADING SECTION*/
          .heading-section {}
  
          .heading-section h2 {
              color: #000000;
              font-size: 28px;
              margin-top: 0;
              line-height: 1.4;
              font-weight: 400;
          }
  
          .heading-section .subheading {
              margin-bottom: 20px !important;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(0, 0, 0, .4);
              position: relative;
          }
  
          .heading-section .subheading::after {
              position: absolute;
              left: 0;
              right: 0;
              bottom: -10px;
              content: '';
              width: 100%;
              height: 2px;
              background: #30e3ca;
              margin: 0 auto;
          }
  
          .heading-section-white {
              color: rgba(255, 255, 255, .8);
          }
  
          .heading-section-white h2 {
              font-family:
                  line-height: 1;
              padding-bottom: 0;
          }
  
          .heading-section-white h2 {
              color: #ffffff;
          }
  
          .heading-section-white .subheading {
              margin-bottom: 0;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(255, 255, 255, .4);
          }
  
  
          ul.social {
              padding: 0;
          }
  
          ul.social li {
              display: inline-block;
              margin-right: 10px;
          }
  
          /*FOOTER*/
  
          .footer {
              border-top: 1px solid rgba(0, 0, 0, .05);
              color: rgba(0, 0, 0, .5);
          }
  
          .footer .heading {
              color: #000;
              font-size: 20px;
          }
  
          .footer ul {
              margin: 0;
              padding: 0;
          }
  
          .footer ul li {
              list-style: none;
              margin-bottom: 10px;
          }
  
          .footer ul li a {
              color: rgba(0, 0, 0, 1);
          }
  
  
          @media screen and (max-width: 500px) {}
      </style>
  
  
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
          <div
              style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
          <div style="max-width: 600px; margin: 0 auto;" class="email-container">
              <!-- BEGIN BODY -->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <!-- <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td class="logo" style="text-align: center;">
                                      <h1><a href="http://masoon.cdoxs.com">Masoon</a></h1>
                                  </td>
                              </tr>
                          </table>
                      </td> -->
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                            <h1 style="text-align: center;margin-bottom:0px; font-weight: 600; color:rgb(207, 101, 181);font-size: 35px;">Masoon</h1>
                              <h3 style="text-align: center;">Better control of your budget</h3>
                          </td>
  
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                          <table>
                              <tr>
                                  <td>
                                      <div class="text" style="padding: 0 2.5em; text-align: center;">
                                          <h3><b>Email Verification</b></h3>
                                          <div style="text-align: left ;font-size:18px ">
                                         <span style="color:#000000"> Please confirm that you want to use this as your Masoon email address. Once it's done you will be able to access your masoon account.</span>
                                          </div>
                                          <div  style="text-align: center ;margin-top: 40px;">
                                              <span style="color:#000000"> Please Click the Link to confirm your Email<br> ${link}</span>
                                            </div>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end tr -->
                  <!-- 1 Column Text + Button : END -->
              </table>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <td valign="middle" class="bg_light footer email-section">
                          <table>
                              <tr>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-right: 10px;">
                                                  <h3 class="heading">About</h3>
                                                  <p>Masoon is an online budget planner which takes charge of your finances.
                                                  A free budget tracker that helps you understand your spendings for a brighter financial future.</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 5px; padding-right: 5px;">
                                                  <h3 class="heading">Contact Info</h3>
                                                  <ul>
                                                      <li><span class="text">203 Lake St. Mountain View, Saudia Arabia,
                                                          </span></li>
                                                      <li><span class="text">+966 392 3929 210</span></a></li>
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 10px;">
                                                  <h3 class="heading">Social Links</h3>
                                                  <ul>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/color/32/000000/facebook-circled--v2.png" /></a>
                                                      </li>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/fluent/32/000000/instagram-new.png" /></a>
                                                      </li>
  
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end: tr -->
                  <!-- <tr>
                      <td class="bg_light" style="text-align: center;">
                          <p>No longer want to receive these email? You can <a href="#"
                                  style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                      </td>
                  </tr> -->
              </table>
  
          </div>
      </center>
  </body>
  
  </html>`
}
const returnHtmlResetPassword = (resetUrl) => {
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
  
      <!-- CSS Reset : BEGIN -->
      <style>
          /* What it does: Remove spaces around the email design added by some email clients. */
          /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background: #f1f1f1;
          }
  
          /* What it does: Stops email clients resizing small text. */
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
  
          /* What it does: Centers email on Android 4.4 */
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
  
          /* What it does: Stops Outlook from adding extra spacing to tables. */
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
          }
  
          /* What it does: Fixes webkit padding issue. */
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
  
          /* What it does: Uses a better rendering method when resizing images in IE. */
          img {
              -ms-interpolation-mode: bicubic;
          }
  
          /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
          a {
              text-decoration: none;
          }
  
          /* What it does: A work-around for email clients meddling in triggered links. */
          *[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
  
          /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
  
          /* What it does: Prevents Gmail from changing the text color in conversation threads. */
          .im {
              color: inherit !important;
          }
  
          /* If the above doesn't work, add a .g-img class to any image in question. */
          img.g-img+div {
              display: none !important;
          }
  
          /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
          /* Create one of these media queries for each additional viewport size you'd like to fix */
  
          /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
              }
          }
  
          /* iPhone 6, 6S, 7, 8, and X */
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
              }
          }
  
          /* iPhone 6+, 7+, and 8+ */
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
              }
          }
      </style>
  
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
          .primary {
              background: #30e3ca;
          }
  
          .bg_white {
              background: #ffffff;
          }
  
          .bg_light {
              background: #fafafa;
          }
  
          .bg_black {
              background: #000000;
          }
  
          .bg_dark {
              background: rgba(0, 0, 0, .8);
          }
  
          .email-section {
              padding: 2.5em;
          }
  
          /*BUTTON*/
          .btn {
              padding: 10px 15px;
              display: inline-block;
          }
  
          .btn.btn-primary {
              border-radius: 5px;
              background: #30e3ca;
              color: #ffffff;
          }
  
          .btn.btn-white {
              border-radius: 5px;
              background: #ffffff;
              color: #000000;
          }
  
          .btn.btn-white-outline {
              border-radius: 5px;
              background: transparent;
              border: 1px solid #fff;
              color: #fff;
          }
  
          .btn.btn-black-outline {
              border-radius: 0px;
              background: transparent;
              border: 2px solid #000;
              color: #000;
              font-weight: 700;
          }
  
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              font-family: 'Lato', sans-serif;
              color: #000000;
              margin-top: 0;
              font-weight: 400;
          }
  
          body {
              font-family: 'Lato', sans-serif;
              font-weight: 400;
              font-size: 15px;
              line-height: 1.8;
              color: rgba(0, 0, 0, .4);
          }
  
          a {
              color: #30e3ca;
          }
  
          table {}
  
          /*LOGO*/
  
          .logo h1 {
              margin: 0;
          }
  
          .logo h1 a {
              color: #5c1ac3;
              font-size: 24px;
              font-weight: 700;
              font-family: 'Lato', sans-serif;
          }
  
          /*HERO*/
          .hero {
              position: relative;
              z-index: 0;
          }
  
          .hero .text {
              color: rgba(0, 0, 0, .3);
          }
  
          .hero .text h2 {
              color: #000;
              font-size: 40px;
              margin-bottom: 0;
              font-weight: 400;
              line-height: 1.4;
          }
  
          .hero .text h3 {
              font-size: 24px;
              font-weight: 300;
          }
  
          .hero .text h2 span {
              font-weight: 600;
              color: #5c1ac3;
          }
  
  
          /*HEADING SECTION*/
          .heading-section {}
  
          .heading-section h2 {
              color: #000000;
              font-size: 28px;
              margin-top: 0;
              line-height: 1.4;
              font-weight: 400;
          }
  
          .heading-section .subheading {
              margin-bottom: 20px !important;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(0, 0, 0, .4);
              position: relative;
          }
  
          .heading-section .subheading::after {
              position: absolute;
              left: 0;
              right: 0;
              bottom: -10px;
              content: '';
              width: 100%;
              height: 2px;
              background: #30e3ca;
              margin: 0 auto;
          }
  
          .heading-section-white {
              color: rgba(255, 255, 255, .8);
          }
  
          .heading-section-white h2 {
              font-family:
                  line-height: 1;
              padding-bottom: 0;
          }
  
          .heading-section-white h2 {
              color: #ffffff;
          }
  
          .heading-section-white .subheading {
              margin-bottom: 0;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(255, 255, 255, .4);
          }
  
  
          ul.social {
              padding: 0;
          }
  
          ul.social li {
              display: inline-block;
              margin-right: 10px;
          }
  
          /*FOOTER*/
  
          .footer {
              border-top: 1px solid rgba(0, 0, 0, .05);
              color: rgba(0, 0, 0, .5);
          }
  
          .footer .heading {
              color: #000;
              font-size: 20px;
          }
  
          .footer ul {
              margin: 0;
              padding: 0;
          }
  
          .footer ul li {
              list-style: none;
              margin-bottom: 10px;
          }
  
          .footer ul li a {
              color: rgba(0, 0, 0, 1);
          }
  
  
          @media screen and (max-width: 500px) {}
      </style>
  
  
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
          <div
              style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
          <div style="max-width: 600px; margin: 0 auto;" class="email-container">
              <!-- BEGIN BODY -->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <!-- <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td class="logo" style="text-align: center;">
                                      <h1><a href="http://masoon.cdoxs.com">Masoon</a></h1>
                                  </td>
                              </tr>
                          </table>
                      </td> -->
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                         <h1 style="text-align: center;margin-bottom:0px; font-weight: 600; color:rgb(207, 101, 181);font-size: 35px;">Masoon</h1>
                              <h3 style="text-align: center;">Better control of your budget</h3>
                       </td>
  
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                          <table>
                              <tr>
                                  <td>
                                      <div class="text" style="padding: 0 2.5em; text-align: center;">
                                          <h2>Please click this link to verify your email: ${resetUrl}</h2>
                                          <div class="mt-5" style="text-align: left">
                                              <b>
                                                  <div class="mt-3" class="text-dark">
                                                      The Code will be active for 60 seconds. If you don't enter it on the
                                                      Masoon
                                                      OTP Verification
                                                      page it will be expired ,you can resend it.
                                                  </div>
                                                  <div class="mt-3" class="text-dark">
                                                      If you don't recognize or expect this email , you can always report
                                                      suspicious behaviour to
                                                      our team support.
                                                  </div>
                                                  <div class="mt-4" class="text-dark">
                                                      <h3>
                                                          The Masoon Team
                                                      </h3>
                                                  </div>
                                              </b>
                                          </div>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end tr -->
                  <!-- 1 Column Text + Button : END -->
              </table>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <td valign="middle" class="bg_light footer email-section">
                          <table>
                              <tr>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-right: 10px;">
                                                  <h3 class="heading">About</h3>
                                                  <p>Masoon is an online budget planner which takes charge of your finances.
                                                  A free budget tracker that helps you understand your spendings for a brighter financial future.</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 5px; padding-right: 5px;">
                                                  <h3 class="heading">Contact Info</h3>
                                                  <ul>
                                                  <li><span class="text">203 Masoon Inc.
                                                      </span></li>
                                                  <li><span class="text">Attention: HQ-Electro Designated Agent</span></a></li>
                                                  <li><span class="text">Anas Ibn Malik Rd, Alyasmin</span></a></li>
                                                  <li><span class="text">Riyadh 13326</span></a></li>
                                                  <li><span class="text">Email: info@HQ-electro.com</span></a></li>
                                              </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 10px;">
                                                  <h3 class="heading">Social Links</h3>
                                                  <ul>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/color/32/000000/facebook-circled--v2.png" /></a>
                                                      </li>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/fluent/32/000000/instagram-new.png" /></a>
                                                      </li>
  
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end: tr -->
                  <!-- <tr>
                      <td class="bg_light" style="text-align: center;">
                          <p>No longer want to receive these email? You can <a href="#"
                                  style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                      </td>
                  </tr> -->
              </table>
  
          </div>
      </center>
  </body>
  
  </html>`
}
const returnHtmlAdvMail = (email, password) => {
  return `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
  
      <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
  
      <!-- CSS Reset : BEGIN -->
      <style>
          /* What it does: Remove spaces around the email design added by some email clients. */
          /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background: #f1f1f1;
          }
  
          /* What it does: Stops email clients resizing small text. */
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
  
          /* What it does: Centers email on Android 4.4 */
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
  
          /* What it does: Stops Outlook from adding extra spacing to tables. */
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
          }
  
          /* What it does: Fixes webkit padding issue. */
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
  
          /* What it does: Uses a better rendering method when resizing images in IE. */
          img {
              -ms-interpolation-mode: bicubic;
          }
  
          /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
          a {
              text-decoration: none;
          }
  
          /* What it does: A work-around for email clients meddling in triggered links. */
          *[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links *,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
  
          /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
  
          /* What it does: Prevents Gmail from changing the text color in conversation threads. */
          .im {
              color: inherit !important;
          }
  
          /* If the above doesn't work, add a .g-img class to any image in question. */
          img.g-img+div {
              display: none !important;
          }
  
          /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
          /* Create one of these media queries for each additional viewport size you'd like to fix */
  
          /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
              }
          }
  
          /* iPhone 6, 6S, 7, 8, and X */
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
              }
          }
  
          /* iPhone 6+, 7+, and 8+ */
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
              }
          }
      </style>
  
      <!-- CSS Reset : END -->
  
      <!-- Progressive Enhancements : BEGIN -->
      <style>
          .primary {
              background: #30e3ca;
          }
  
          .bg_white {
              background: #ffffff;
          }
  
          .bg_light {
              background: #fafafa;
          }
  
          .bg_black {
              background: #000000;
          }
  
          .bg_dark {
              background: rgba(0, 0, 0, .8);
          }
  
          .email-section {
              padding: 2.5em;
          }
  
          /*BUTTON*/
          .btn {
              padding: 10px 15px;
              display: inline-block;
          }
  
          .btn.btn-primary {
              border-radius: 5px;
              background: #30e3ca;
              color: #ffffff;
          }
  
          .btn.btn-white {
              border-radius: 5px;
              background: #ffffff;
              color: #000000;
          }
  
          .btn.btn-white-outline {
              border-radius: 5px;
              background: transparent;
              border: 1px solid #fff;
              color: #fff;
          }
  
          .btn.btn-black-outline {
              border-radius: 0px;
              background: transparent;
              border: 2px solid #000;
              color: #000;
              font-weight: 700;
          }
  
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              font-family: 'Lato', sans-serif;
              color: #000000;
              margin-top: 0;
              font-weight: 400;
          }
  
          body {
              font-family: 'Lato', sans-serif;
              font-weight: 400;
              font-size: 15px;
              line-height: 1.8;
              color: rgba(0, 0, 0, .4);
          }
  
          a {
              color: #30e3ca;
          }
  
          table {}
  
          /*LOGO*/
  
          .logo h1 {
              margin: 0;
          }
  
          .logo h1 a {
              color: #5c1ac3;
              font-size: 24px;
              font-weight: 700;
              font-family: 'Lato', sans-serif;
          }
  
          /*HERO*/
          .hero {
              position: relative;
              z-index: 0;
          }
  
          .hero .text {
              color: rgba(0, 0, 0, .3);
          }
  
          .hero .text h2 {
              color: #000;
              font-size: 40px;
              margin-bottom: 0;
              font-weight: 400;
              line-height: 1.4;
          }
  
          .hero .text h3 {
              font-size: 24px;
              font-weight: 300;
          }
  
          .hero .text h2 span {
              font-weight: 600;
              color: #5c1ac3;
          }
  
  
          /*HEADING SECTION*/
          .heading-section {}
  
          .heading-section h2 {
              color: #000000;
              font-size: 28px;
              margin-top: 0;
              line-height: 1.4;
              font-weight: 400;
          }
  
          .heading-section .subheading {
              margin-bottom: 20px !important;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(0, 0, 0, .4);
              position: relative;
          }
  
          .heading-section .subheading::after {
              position: absolute;
              left: 0;
              right: 0;
              bottom: -10px;
              content: '';
              width: 100%;
              height: 2px;
              background: #30e3ca;
              margin: 0 auto;
          }
  
          .heading-section-white {
              color: rgba(255, 255, 255, .8);
          }
  
          .heading-section-white h2 {
              font-family:
                  line-height: 1;
              padding-bottom: 0;
          }
  
          .heading-section-white h2 {
              color: #ffffff;
          }
  
          .heading-section-white .subheading {
              margin-bottom: 0;
              display: inline-block;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: rgba(255, 255, 255, .4);
          }
  
  
          ul.social {
              padding: 0;
          }
  
          ul.social li {
              display: inline-block;
              margin-right: 10px;
          }
  
          /*FOOTER*/
  
          .footer {
              border-top: 1px solid rgba(0, 0, 0, .05);
              color: rgba(0, 0, 0, .5);
          }
  
          .footer .heading {
              color: #000;
              font-size: 20px;
          }
  
          .footer ul {
              margin: 0;
              padding: 0;
          }
  
          .footer ul li {
              list-style: none;
              margin-bottom: 10px;
          }
  
          .footer ul li a {
              color: rgba(0, 0, 0, 1);
          }
  
  
          @media screen and (max-width: 500px) {}
      </style>
  
  
  </head>
  
  <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
      <center style="width: 100%; background-color: #f1f1f1;">
          <div
              style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
          <div style="max-width: 600px; margin: 0 auto;" class="email-container">
              <!-- BEGIN BODY -->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <!-- <td valign="top" class="bg_white" style="padding: 1em 2.5em 0 2.5em;">
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                  <td class="logo" style="text-align: center;">
                                      <h1><a href="http://masoon.cdoxs.com">Masoon</a></h1>
                                  </td>
                              </tr>
                          </table>
                      </td> -->
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                          <h1 style="text-align: center;margin-bottom:0px; font-weight: 600; color:rgb(207, 101, 181);font-size: 35px;">Masoon</h1>
                              <h3 style="text-align: center;">Better control of your budget</h3>
                      </td>
  
                  </tr><!-- end tr -->
                  <tr>
                      <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                          <table>
                              <tr>
                                  <td>
                                      <div class="text" style="padding: 0 2.5em; text-align: center;">
                                          <h2>Welcome to Masoon</h2>
                                          <div class="mt-5" style="text-align: left">
                                              <b>
                                                  <div class="mt-3" class="text-dark">
                                                      You are receiving this email from Masoon
                                                      You can use following credentials for login to your Masoon Advertisor account
                                                      <h3>Email: ${email} </h3>
                                                      <h3>Password ${password}</h3>
                                                  </div>
                                                  <div class="mt-3" class="text-dark">
                                                      If you don't recognize or expect this email , you can always report
                                                      suspicious behaviour to
                                                      our team support.
                                                  </div>
                                                  <div class="mt-4" class="text-dark">
                                                      <h3>
                                                          The Masoon Team
                                                      </h3>
                                                  </div>
                                              </b>
                                          </div>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end tr -->
                  <!-- 1 Column Text + Button : END -->
              </table>
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <tr>
                      <td valign="middle" class="bg_light footer email-section">
                          <table>
                              <tr>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-right: 10px;">
                                                  <h3 class="heading">About</h3>
                                                  <p>Masoon is an online budget planner which takes charge of your finances.
                                                  A free budget tracker that helps you understand your spendings for a brighter financial future.</p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 5px; padding-right: 5px;">
                                                  <h3 class="heading">Contact Info</h3>
                                                  <ul>
                                                  <li><span class="text">203 Masoon Inc.
                                                      </span></li>
                                                  <li><span class="text">Attention: HQ-Electro Designated Agent</span></a></li>
                                                  <li><span class="text">Anas Ibn Malik Rd, Alyasmin</span></a></li>
                                                  <li><span class="text">Riyadh 13326</span></a></li>
                                                  <li><span class="text">Email: info@HQ-electro.com</span></a></li>
                                              </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                                  <td valign="top" width="33.333%" style="padding-top: 20px;">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                          <tr>
                                              <td style="text-align: left; padding-left: 10px;">
                                                  <h3 class="heading">Social Links</h3>
                                                  <ul>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/color/32/000000/facebook-circled--v2.png" /></a>
                                                      </li>
                                                      <li><a href="#"><img
                                                                  src="https://img.icons8.com/fluent/32/000000/instagram-new.png" /></a>
                                                      </li>
  
                                                  </ul>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr><!-- end: tr -->
                  <!-- <tr>
                      <td class="bg_light" style="text-align: center;">
                          <p>No longer want to receive these email? You can <a href="#"
                                  style="color: rgba(0,0,0,.8);">Unsubscribe here</a></p>
                      </td>
                  </tr> -->
              </table>
  
          </div>
      </center>
  </body>
  
  </html>`
}

