const asyncHandler = require("../../middleware/async");
const Ads = require("../../models/ads/ads");
const User = require('../../models/users_model')
const UserPackage = require('../../models/UserPackage');
const Package = require('../../models/packages');
const Clicks = require('../../models/ads/Clicks')
const Views = require('../../models/ads/Views')
const Impressions = require('../../models/ads/Impressions');
const Revenue = require('../../models/ads/Revenue');
const nodemailer = require('nodemailer');
const pushNot = require('../../middleware/pushNotification')
const Notification = require('../../models/Notifications');
const sendEmailByAdmin = require("../../middleware/mails");
const decrypt = require("../../middleware/GenerateRSAKeys");
const encrypt = require("../../middleware/GenerateAESKeys");
const { emailAlert, arEmailAlert } = require("../templates/enMail");

exports.createAd = asyncHandler(async (req, res, next) => {
    try {
        let { title, description, link, user_package_id, type } = req.body;
        const package = await UserPackage.findById({ _id: JSON.parse(decrypt(user_package_id)) });
        const date = new Date();
        const new_ad = await Ads.create({
            title: JSON.parse(decrypt(title)),
            description: JSON.parse(decrypt(description)),
            file: req.file.path.replace("\\", "/"),
            link: JSON.parse(decrypt(link)),
            user_id: req.user.id,
            createdAt: date.getTime(),
            expiresAt: package.expiresAt,
            user_package_id: JSON.parse(decrypt(user_package_id)),
            type: JSON.parse(decrypt(type))
        });
        const admin = await User.findOne({ roll: 'Admin' })
        let enMessage = `You have a new ad request from ${req.user.firstname + ' ' + req.user.lastname}, please review and approve`
        let enSubject = 'New Ad request for MASOON'
        let arMessage = `لديك طلب إعلان جديد من ${req.user.firstname + ' ' + req.user.lastname} ، يرجى المراجعة والموافقة`
        let arSubject = 'طلب إعلان جديد لمصون'
        if (req.user.language == "en") {
            // mail options
            let mailOptions = {
                from: req.user.email,
                to: process.env.EMAIL,
                subject: 'New Ad request for MASOON',
                html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
            };
            sendEmailByAdmin(mailOptions);
            const update_user_package = await UserPackage.findByIdAndUpdate(
                { _id: JSON.parse(decrypt(user_package_id)) },
                { ads_count: package.ads_count + 1 },
                { new: true, useFindAndModify: false }
            );
        } else {
            // mail options
            let mailOptions = {
                from: req.user.email,
                to: process.env.EMAIL,
                subject: 'New Ad request for MASOON',
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, arSubject),
            };
            sendEmailByAdmin(mailOptions);
            const update_user_package = await UserPackage.findByIdAndUpdate(
                { _id: JSON.parse(decrypt(user_package_id)) },
                { ads_count: package.ads_count + 1 },
                { new: true, useFindAndModify: false }
            );
        }
        const alert_for_publisher = await Notification.create({
            user_id: admin.id,
            body: enMessage,
            subject: enSubject,
            arbody: arMessage,
            arsubject: arSubject
        });

        let resp = {
            status: 200,
            message: 'Ad Created',
            armessage: 'تم إنشاء الإعلان'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while posting ad',
            armessage: `خطأ كامل في نشر الإعلان`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.createUserPackage = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        let { package_id } = cred
        const date = new Date();
        const package = await Package.findById({ _id: package_id });
        let duration = package.duration
        const new_User_Package = await UserPackage.create({
            package_id,
            package_name: package.name,
            package_arname: package.arname,
            user_id: req.user.id,
            user_name: req.user.firstname + ' ' + req.user.lastname,
            status: 'Pending',
            createdAt: date.getTime(),
            ads_count: 0
        });

        // if (req.user.language == 'en') {
        // mail options
        let enMessage = `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}, please review and approve`
        let enSubject = 'New Package request for MASOON'
        let mailOptions = {
            from: req.user.email,
            to: process.env.EMAIL,
            subject: enSubject,
            html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
        };
        sendEmailByAdmin(mailOptions);

        const admin = await User.findOne({ roll: 'Admin' })
        if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
            var mes = {
                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                contents: { en: `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}` },
                include_player_ids: [admin.playerId]
            };
            pushNot.sendNotification(mes);
        }
        const alert_for_publisher = await Notification.create({
            user_id: admin.id,
            body: enMessage,
            subject: 'Package Request',
            arbody: "arMessage",
            arsubject: "arSubject"
        });
        // } else {
        //     let arMessage = `لديك طلب حزمة جديد من ${req.user.firstname + ' ' + req.user.lastname} ، يرجى المراجعة والموافقة`
        //     let arSubject = 'طلب حزمة جديدة لماسون'
        //     // mail options
        //     let mailOptions = {
        //         from: req.user.email,
        //         to: process.env.EMAIL,
        //         subject: arSubject,
        //         html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, arSubject),
        //     };
        //     sendEmailByAdmin(mailOptions);

        //     const admin = await User.findOne({ roll: 'Admin' })
        //     if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
        //         var mes = {
        //             app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
        //             contents: { en: arMessage },
        //             include_player_ids: [admin.playerId]
        //         };
        //         pushNot.sendNotification(mes);
        //     }
        // }


        let resp = {
            status: 200,
            message: 'Package Assigned to User',
            armessage: `الباقة المخصصة للمستخدم`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while creating user package',
            armessage: `خطأ أثناء إنشاء باقة المستخدم`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.getUserPackage = asyncHandler(async (req, res, next) => {
    try {
        const user_Packages = await UserPackage.find({ user_id: req.user.id });
        let resp = {
            status: 200,
            user_Packages
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.getUserPackageById = asyncHandler(async (req, res, next) => {
    try {
        const user_Package = await UserPackage.find({ _id: req.params.id });
        res.status(200).json({
            status: 200,
            user_Package
        });
    } catch (err) {
        next(err);
    }
});
exports.suspendUserPackage = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        const user_Packages = await UserPackage.findByIdAndDelete(
            { _id: cred.user_package_id }
        );
        let user_ = await UserPackage.findById({ _id: cred.user_package_id })
        const user = await User.findById({ _id: user_Packages.user_id });
        if (user.language == 'ar') {
            if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `عزيزي المستخدم تم تعليق الحزمة الخاصة بك بواسطة Masoon` },
                    include_player_ids: [user.playerId]
                };
                pushNot.sendNotification(mes);
            }
            const alert_for_publisher = await Notification.create({
                user_id: user.id,
                body: `Package has been suspended`,
                subject: 'Masoon alert',
                arbody: `تم تعليق الحزمة`,
                arsubject: 'تنبيه مصون'
            });

            let arMessage = `عزيزي ${user.firstname + " " + user.lastname} تم تعليق باقتك من مصون`;
            let arSubject = `تنبيه مصون`
            let mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: arSubject,
                html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject)
            };
            sendEmailByAdmin(mailOptions)
        } else {
            if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `` },
                    include_player_ids: [user.playerId]
                };
                pushNot.sendNotification(mes);
            }
            const alert_for_publisher = await Notification.create({
                user_id: user.id,
                body: `Package has been suspended`,
                subject: 'Masoon alert',
                arbody: `تم تعليق الحزمة`,
                arsubject: 'تنبيه مصون'
            });

            let enMessage = `Dear ${user.firstname + " " + user.lastname} your package has been suspended`;
            let enSubject = 'Masoon Alert'
            let mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: enSubject,
                html: emailAlert(user.firstname + ' ' + user.lastname, enMessage, enSubject)
            };
            sendEmailByAdmin(mailOptions)
        }

        let resp = {
            status: 200,
            user_Packages
        }

        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while suspending package",
            armessage: `خطأ أثناء إيقاف الباقة`
        }

        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.suspendUserPackageByExpiryDate = asyncHandler(async (req, res, next) => {
    try {
        const date = new Date();
        const user_packages = await UserPackage.find({ user_id: req.user.id });
        for (let i = 0; i < user_packages.length; i++) {
            if (user_packages[i].expiresAt < date && user_packages[i].expiresAt != null) {
                const user_Packages = await UserPackage.findByIdAndUpdate({ _id: user_packages[i].id }, { status: "Expired" }, { new: true, useFindAndModify: false });

                const user = await User.findById({ _id: user_Packages.user_id })
                if (user.language == 'ar') {
                    let arMessage = `انتهت صلاحية الباقة الخاصة بك، يرجى دفع الرسوم لمواصلة إعلانك`
                    let arSubject = 'تنبيه مصون'
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: arSubject,
                        html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject),
                    };
                    sendEmailByAdmin(mailOptions)
                    const alert_for_publisher = await Notification.create({
                        user_id: user.id,
                        body: `Dear user, your package has expired, please renew your package. Your ads will not run until your package is approved`,
                        subject: 'Mason alert',
                        arbody: `عزيزي مستخدم Masoon ، انتهت صلاحية باقتك ، يرجى تجديد باقتك. لن يتم عرض إعلاناتك حتى تتم الموافقة على حزمتك`,
                        arsubject: 'تنبيه مصون'
                    });
                    if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: `عزيزي مستخدم Masoon ، انتهت صلاحية باقتك ، يرجى تجديد باقتك. لن يتم عرض إعلاناتك حتى تتم الموافقة على حزمتك` },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                } else {
                    let enMEssage = 'Your package have been expired, Please pay the charges to continue you advertisement';
                    let enSubject = 'Masoon Alert'
                    let mailOptions = {
                        from: process.env.EMAIL,
                        to: user.email,
                        subject: enSubject,
                        html: emailAlert(user.firstname + ' ' + user.lastname, enMEssage, enSubject),
                    };
                    sendEmailByAdmin(mailOptions)
                    const alert_for_publisher = await Notification.create({
                        user_id: user.id,
                        body: `Dear user, your package has expired, please renew your package. Your ads will not run until your package is approved`,
                        subject: 'Mason alert',
                        arbody: `عزيزي مستخدم Masoon ، انتهت صلاحية باقتك ، يرجى تجديد باقتك. لن يتم عرض إعلاناتك حتى تتم الموافقة على حزمتك`,
                        arsubject: 'تنبيه مصون'
                    });
                    if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                        var mes = {
                            app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                            contents: { en: `Dear user, your package has expired, please renew your package. Your ads won't be displayed until your package is approved` },
                            include_player_ids: [user.playerId]
                        };
                        pushNot.sendNotification(mes);
                    }
                }
            }
        }
        res.status(200).json({
            status: 200,
            message: 'Package Expired',
            armessage: 'انتهت صلاحية الباقة'
        });
    } catch (err) {
        next(err);
    }
});
exports.approveUserPackage = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name))
        const date = new Date();
        const approvedAtDate = new Date();
        const package = await Package.findById({ _id: cred.package_id });
        const user_Packages = await UserPackage.findByIdAndUpdate(
            {
                _id: cred.user_package_id
            },
            {
                approvedAt: approvedAtDate, expiresAt: date.setDate(date.getDate() + package.duration), status: "Approved"
            },
            {
                new: true, useFindAndModify: false
            });

        const user = await User.findById({ _id: user_Packages.user_id })

        const revenue = await Revenue.create({
            user_package_id: user_Packages.id,
            amount: package.amount,
            user_package_name: package.name,
            user_package_arname: package.arname,
            user_id: user_Packages.user_id,
            createdAt: new Date().getTime()
        })

        if (user.language == 'ar') {
            // mail options
            let arMessage = `تمت الموافقة على الباقة الخاصة بك من تطبيق مصون`;
            let arSubject = `تنبيه مصون`
            let mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'تنبيه مصون',
                html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject),
            };
            sendEmailByAdmin(mailOptions)
            if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `تمت الموافقة على الحزمة الخاصة بك من قبل Masoon` },
                    include_player_ids: [user.playerId]
                };
                pushNot.sendNotification(mes);
            }
            const alert_for_publisher = await Notification.create({
                user_id: user.id,
                body: `Your package has been approved by Masoon`,
                subject: 'Mason alert',
                arbody: `تمت الموافقة على الحزمة الخاصة بك من قبل Masoon`,
                arsubject: 'تنبيه مصون'
            });

        } else {
            // mail options
            let enMEssage = `Your package has been approved by Masoon`;
            let enSubject = 'Masoon Alert';
            let mailOptions = {
                from: process.env.EMAIL,
                to: user.email,
                subject: 'Masoon Alert',
                html: emailAlert(user.firstname + ' ' + user.lastname, enMEssage, enSubject),
            };
            sendEmailByAdmin(mailOptions)
            if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `Your package has been approved by Masoon` },
                    include_player_ids: [user.playerId]
                };
                pushNot.sendNotification(mes);
            }
            const alert_for_publisher = await Notification.create({
                user_id: user.id,
                body: `Your package has been approved by Masoon`,
                subject: 'Mason alert',
                arbody: `تمت الموافقة على الحزمة الخاصة بك من قبل Masoon`,
                arsubject: 'تنبيه مصون'
            });
        }

        let resp = {
            status: 200,
            user_Packages
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while approving package",
            armessage: `خطأ أثناء الموافقة على الباقة`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.requestRenewalOfUserPackage = asyncHandler(async (req, res, next) => {
    try {
        const date = new Date();
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const user_Packages = await UserPackage.findByIdAndUpdate(
            { _id: cred.package_id },
            { status: "Pending", expiresAt: null },
            { new: true, useFindAndModify: false });

        let arMessage = `لديك طلب حزمة جديد من ${req.user.firstname + ' ' + req.user.lastname} ، يرجى المراجعة والموافقة`
        let arSubject = 'طلب حزمة جديدة لماسون'
        let enMessage = `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}, please review and approve`
        let enSubject = 'New Package request for MASOON'
        if (req.user.language == 'en') {
            // mail options
            let enMessage = `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}, please review and approve`
            let enSubject = 'New Package request for MASOON'
            let mailOptions = {
                from: req.user.email,
                to: process.env.EMAIL,
                subject: enSubject,
                html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
            };
            sendEmailByAdmin(mailOptions);

            const admin = await User.findOne({ roll: 'Admin' })
            if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}` },
                    include_player_ids: [admin.playerId]
                };
                pushNot.sendNotification(mes);
            }
        } else {

            // mail options
            let mailOptions = {
                from: req.user.email,
                to: process.env.EMAIL,
                subject: arSubject,
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, arSubject),
            };
            sendEmailByAdmin(mailOptions);

            const admin = await User.findOne({ roll: 'Admin' })
            if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: arMessage },
                    include_player_ids: [admin.playerId]
                };
                pushNot.sendNotification(mes);
            }
        }
        const admin = await User.findOne({ roll: 'Admin' })
        const alert_for_publisher = await Notification.create({
            user_id: admin.id,
            body: enMessage,
            subject: enSubject,
            arbody: arMessage,
            arsubject: arSubject
        });

        let resp = {
            status: 200,
            user_Packages
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.views = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const createView = await Views.create({
            ad_id: cred.ad_id
        })
        let resp = {
            status: 200,
            message: 'Ad viewed',
            armessage: 'تمت مشاهدة الإعلان'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while processing request",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
})
exports.impressions = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const createImpression = await Impressions.create({
            ad_id: cred.ad_id
        })

        let resp = {
            status: 200,
            message: 'Impression added',
            armessage: 'تمت إضافة الانطباع'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while processing",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
})
exports.clicks = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const createClick = await Clicks.create({
            ad_id: cred.ad_id
        })

        let resp = {
            status: 200,
            message: 'Ad clicked',
            armessage: 'تم النقر فوق الإعلان'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while processing request",
            armessage: 'خطأ أثناء المعالجة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getAdInsights = asyncHandler(async (req, res, next) => {
    try {

        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const day = cred.day
        const month = cred.month
        const year = cred.year
        const ad_id = cred.ad_id
        var lastDay = new Date(year, month, 0);
        console.log(cred)

        let count_with_eachDay = [];
        let count_with_month = [];

        const clicks = await Clicks.find({ ad_id: cred.ad_id })
        const views = await Views.find({ ad_id: cred.ad_id })
        const impressions = await Impressions.find({ ad_id: cred.ad_id })

        if (cred.status == 0) {
            var total_clicks = await clicks.filter(m => m.createdAt.getDate() == day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
            var total_views = await views.filter(m => m.createdAt.getDate() == day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
            var total_impressions = await impressions.filter(m => m.createdAt.getDate() == day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        }
        else if (cred.status == 1) {
            for (let i = 1; i <= lastDay.getDate(); i++) {
                var total_clicks = await clicks.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
                var total_views = await views.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
                var total_impressions = await impressions.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
                count_with_eachDay.push({ date: i, counts: [total_clicks.length, total_views.length, total_impressions.length] })
            }
        }
        else if (cred.status == 2) {
            var total_clicks = await clicks.filter(m => m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
            var total_views = await views.filter(m => m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
            var total_impressions = await impressions.filter(m => m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        }

        let resp = {
            status: 200,
            total_clicks: total_clicks.length,
            total_views: total_views.length,
            total_impressions: total_impressions.length,
            count_with_eachDay
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getAdInsightsForExpiredAds = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const ad = await Ads.findById({ _id: cred.id });
        const day = ad.expiresAt.getDate();
        const month = ad.expiresAt.getMonth() + 1;
        const year = ad.expiresAt.getFullYear();

        const clicks = await Clicks.find({ ad_id: ad.id })
        const views = await Views.find({ ad_id: ad.id })
        const impressions = await Impressions.find({ ad_id: ad.id })

        var total_clicks = await clicks.filter(m => m.createdAt.getDate() <= day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        var total_views = await views.filter(m => m.createdAt.getDate() <= day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        var total_impressions = await impressions.filter(m => m.createdAt.getDate() < day && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)

        let resp = {
            status: 200,
            total_clicks: total_clicks.length,
            total_views: total_views.length,
            total_impressions: total_impressions.length,
            ad
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
exports.blockAds = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const ads = await Ads.findById({ _id: cred.id });
        if (ads) {
            const user = await User.findById({ _id: ads.user_id });
            const update_ad = await Ads.findByIdAndUpdate({ _id: cred.id }, { status: "Blocked" }, { new: true, useFindAndModify: false });
            let arMEssage = 'عزيزي المعلن، تم حظر إعلانك بواسطة مصون'
            let arSubject = 'تم حظر الإعلان '
            if (user.language == "ar") {

                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: erSubject,
                    html: arEmailAlert(user.firstname + ' ' + user.lastname, arMEssage, arSubject),
                };
                sendEmailByAdmin(mailOptions)

                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    arbody: arMEssage,
                    arsubject: arSubject,
                    body: `Dear Masoon advertiser your Ad has been blocked by Masoon`,
                    subject: 'Ad Blocked'
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `تم حظر الإعلان ` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }

            } else {
                let enMEssage = 'Dear Masoon advertiser your Ad has been blocked by Masoon'
                let enSubject = 'Ad Blocked'
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: enSubject,
                    html: emailAlert(user.firstname + ' ' + user.lastname, enMEssage, enSubject),
                };
                sendEmailByAdmin(mailOptions)

                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    arbody: arMEssage,
                    arsubject: arSubject,
                    body: `Dear Masoon advertiser your Ad has been blocked by Masoon`,
                    subject: 'Ad Blocked'
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `Ad Blocked` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }
            }
            let resp = {
                status: 200,
                message: 'Ad Blocked',
                armessage: `تم حظر الإعلان`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else {
            let resp = {
                status: 200,
                message: 'Ad not found',
                armessage: 'الإعلان غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.suspendAd = asyncHandler(async (req, res, next) => {
    let date = new Date();
    try {
        const ads = await Ads.find({ user_id: req.user.id });
        if (ads) {
            for (let i = 0; i < ads.length; i++) {
                if (ads[i].expiresAt <= date.getTime()) {
                    const update_ad = await Ads.findByIdAndUpdate({ _id: ads[i].id }, { status: "Expired" }, {
                        new: true,
                        useUnifiedTopology: false
                    });
                    let arMessage = `عزيزي مستخدم مصون، لقد انتهت صلاحية إعلانك`
                    let arSubject = 'تنبيه مصون'
                    let enSubject = 'Masoon Alert'
                    let enMessage = 'Dear user, your ad has expired'
                    if (user.language == "ar") {
                        const alert_for_publisher = await Notification.create({
                            user_id: req.user.id,
                            arbody: arMessage,
                            arsubject: arSubject,
                            body: enMessage,
                            subject: enSubject
                        });
                        if (!(req.user.playerId == undefined || req.req.user.playerId == 'disabled')) {
                            var mes = {
                                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                                contents: { en: `عزيزي مستخدم Masoon ، لقد انتهت صلاحية إعلانك` },
                                include_player_ids: [req.user.playerId]
                            };
                            pushNot.sendNotification(mes);
                        }

                        let mailOptions = {
                            from: process.env.EMAIL,
                            to: req.user.email,
                            subject: arSubject,
                            html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, arSubject)
                        };
                        sendEmailByAdmin(mailOptions)
                    } else {
                        const alert_for_publisher = await Notification.create({
                            user_id: req.user.id,
                            arbody: arMessage,
                            arsubject: arSubject,
                            body: enMessage,
                            subject: enSubject
                        });
                        if (!(req.user.playerId == undefined || req.req.user.playerId == 'disabled')) {
                            var mes = {
                                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                                contents: { en: `Dear user, your ad has expired` },
                                include_player_ids: [req.user.playerId]
                            };
                            pushNot.sendNotification(mes);
                        }

                        let enMessage = `Dear ${req.user.firstname + ' ' + req.user.lastname} your ad has expired`
                        let enSubject = 'Masoon Alert'
                        let mailOptions = {
                            from: process.env.EMAIL,
                            to: req.user.email,
                            subject: enSubject,
                            html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject)
                        };
                        sendEmailByAdmin(mailOptions)
                    }
                }
            }
            res.status(200).json({
                status: 200,
                message: 'Ad Expired',
                armessage: `الإعلان منتهي الصلاحية`
            });
        }
        else {
            res.status(200).json({
                status: 200,
                message: 'Ad not found',
                armessage: 'الإعلان غير موجود'
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            error: "Error while sespending ad",
            armessage: 'خطأ أثناء إرسال الإعلان'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.adRenewRequest = asyncHandler(async (req, res, next) => {
    let date = new Date();
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const ad_to_be_updated = await Ads.findById({ _id: cred.ad_id });
        const user_package = await UserPackage.findById({ _id: ad_to_be_updated.user_package_id })
        if (user_package.status == "Expired") {
            let resp = {
                status: 200,
                message: 'Your package has expired, Please renew your package and than request ad renewal',
                armessage: 'انتهت صلاحية الباقة الخاصة بك ، يرجى طلب تجديد الإعلان'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        } else {
            const ad = await Ads.findByIdAndUpdate({ _id: cred.ad_id }, { status: "Pending" }, { new: true, useFindAndModify: false });
            // mail options
            let admin = await User.findOne({ roll: 'Admin' });
            let enMessage = `Your have a new Ad renewal request from ${req.user.firstname + ' ' + req.user.lastname}`
            let enSubject = 'Ad renew request'
            if (admin) {

                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: enSubject,
                    html: emailAlert(admin.firstname + ' ' + admin.lastname, enMessage, enSubject),
                };
                sendEmailByAdmin(mailOptions)
                if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `You have a new Ad renewal request from ${req.user.firstname + ' ' + req.user.lastname}` },
                        include_player_ids: [admin.playerId]
                    };
                    pushNot.sendNotification(mes);
                }
            }
            const alert_for_publisher = await Notification.create({
                user_id: admin.id,
                body: enMessage,
                subject: enSubject,
                arbody: "",
                arsubject: ""
            });

            let resp = {
                status: 200,
                ad
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            error: "Error while renewing ad",
            armessage: `خطأ أثناء تجديد الإعلان`
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.unblockAds = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const ads = await Ads.findById({ _id: cred.id });
        if (ads) {
            const update_ad = await Ads.findByIdAndUpdate({ _id: cred.id }, { status: "Approved" }, {
                new: true,
                useUnifiedTopology: false
            });
            const update_User_package = await UserPackage.findById({ _id: update_ad.user_package_id })
            const update_User_package_ = await UserPackage.findByIdAndUpdate(
                { _id: update_ad.user_package_id },
                { ads_count: update_User_package.ads_count + 1 },
                { new: true, useFindAndModify: false }
            );

            const user = await User.findById({ _id: ads.user_id });
            if (user.language == "ar") {
                let arMessage = `عزيزي ${user.firstname + '' + user.lastname} تمت الموافقة على إعلانك من قبل مصون`
                let arSubject = 'الإعلان مفتوح';
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: arSubject,
                    html: arEmailAlert(user.firstname + ' ' + user.lastname, arMessage, arSubject)
                };
                sendEmailByAdmin(mailOptions)

                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    arbody: `تمت الموافقة على إعلانك من قبل مصون`,
                    arsubject: 'تمت الموافقة على الإعلان',
                    body: `You Ad has been Approved by Masoon`,
                    subject: 'Ad Approved'
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `تمت الموافقة على إعلانك من قبل مصون` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }

            } else {
                let enMessage = `Your Ad has been Approved by Masoon`
                let enSubject = `Masoon Alert`;
                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: enSubject,
                    html: emailAlert(user.firstname + ' ' + user.lastname, enMessage, enSubject)
                };
                sendEmailByAdmin(mailOptions)

                const alert_for_publisher = await Notification.create({
                    user_id: user.id,
                    arbody: `تمت الموافقة على إعلانك من قبل مصون`,
                    arsubject: 'تمت الموافقة على الإعلان',
                    body: `You Ad has been Approved by Masoon`,
                    subject: 'Ad Approved'
                });
                if (user.playerId !== null) {
                    var mes = {
                        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                        contents: { en: `You Ad has been Approved by Masoon` },
                        include_player_ids: [user.playerId]
                    };
                    pushNot.sendNotification(mes);
                }
            }

            let resp = {
                status: 200,
                message: 'Ad Approved',
                armessage: 'تمت الموافقة على الإعلان'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
        else {
            let resp = {
                status: 200,
                message: 'Ad not found',
                armessage: 'الإعلان غير موجود'
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});
exports.getAds = asyncHandler(async (req, res, next) => {
    try {
        const get_ads = await Ads.find({ status: "Approved" });
        let resp = {
            status: 200,
            Ads: get_ads
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    catch (err) {
        next(err);
        let resp = {
            status: 200,
            Ads: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.getAdsOfCurrnetUser = asyncHandler(async (req, res, next) => {
    try {
        const get_ads = await Ads.find({ user_id: req.user.id });
        const get_ads_pending = get_ads.filter(ad => ad.status === 'Pending');
        const get_ads_blocked = get_ads.filter(ad => ad.status === 'Blocked');
        const get_ads_expired = get_ads.filter(ad => ad.status === 'Expired');
        const get_ads_approved = get_ads.filter(ad => ad.status === 'Approved');
        let resp = {
            status: 200,
            all_ads: get_ads,
            Pending: get_ads_pending,
            Blocked: get_ads_blocked,
            Expired: get_ads_expired,
            Approved: get_ads_approved
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
    catch (err) {
        next(err);
        let resp = {
            status: 200,
            Ads: 'Error while fetching data',
            armessage: 'خطأ أثناء جلب البيانات'
        }
        res.status(201).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});
exports.totalAds_count = asyncHandler(async (req, res, next) => {
    try {
        const user_package = await UserPackage.find({ user_id: req.user.id });
        let ads = await Ads.find({ user_id: req.user.id, status: "Approved" });
        let remaining_ads_count = 0
        if (user_package.length > 0) {
            const package = await Package.findById({ _id: user_package[0].package_id });
            remaining_ads_count = package.ads_per_package - ads.length
        }
        let resp = {
            status: 200,
            remaining_ads_count
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
exports.upgradePackage = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let { package_id, user_package_id } = cred;
        const user_package = await UserPackage.findById({ _id: user_package_id });
        const date = new Date();
        const package = await Package.findById({ _id: package_id });
        const new_User_Package = await UserPackage.findByIdAndUpdate(
            { _id: user_package.id },
            {
                package_id: package_id,
                package_name: package.name,
                package_arname: package.arname,
                user_id: req.user.id,
                user_name: req.user.firstname + ' ' + req.user.lastname,
                status: 'Pending',
                createdAt: date.getTime(),
                ads_count: 0,
                expiresAt: null
            }, { new: true, useFindAndModify: false });
        let enMessage = `You have a new package upgrade request from ${req.user.firstname + ' ' + req.user.lastname}, please review and approve`
        let enSubject = 'New Package upgrade request for MASOON'
        let mailOptions = {
            from: req.user.email,
            to: process.env.EMAIL,
            subject: enSubject,
            html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
        };
        sendEmailByAdmin(mailOptions);

        const admin = await User.findOne({ roll: 'Admin' })
        if (!(admin.playerId == undefined || admin.playerId == null || admin.playerId == 'disabled')) {
            var mes = {
                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                contents: { en: `You have a new package request from ${req.user.firstname + ' ' + req.user.lastname}` },
                include_player_ids: [admin.playerId]
            };
            pushNot.sendNotification(mes);
        }
        const alert_for_publisher = await Notification.create({
            user_id: admin.id,
            body: enMessage,
            subject: enSubject,
            arbody: "",
            arsubject: ""
        });
        let resp = {
            status: 200,
            new_User_Package
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })

    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: 'Error while updating package',
            armessage: 'خطأ أثناء تحديث الباقة'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        })
    }
});

