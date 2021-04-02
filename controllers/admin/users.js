const asyncHandler = require("../../middleware/async");
const User = require("../../models/users_model");
const Transaction = require("../../models/transactions");
const Bills = require("../../models/bills");
const Message = require("../../models/message");
const Notification = require("../../models/Notifications");
const Ads = require("../../models/ads/ads");
const Budget = require("../../models/budgets");
const Logger = require("../../models/Logger");
const Packages = require("../../models/packages");
const UserPackage = require("../../models/UserPackage");
const Clicks = require('../../models/ads/Clicks');
const Views = require('../../models/ads/Views');
const Impressions = require('../../models/ads/Impressions');
const Revenue = require('../../models/ads/Revenue');
const AppInstalled = require('../../models/AppInstall');
const Bank = require('../../models/Banks');
const pushNot = require('../../middleware/pushNotification');
const Income = require('../../models/Income');
const sendEmailByAdmin = require("../../middleware/mails");
const decrypt = require("../../middleware/GenerateRSAKeys");
const encrypt = require("../../middleware/GenerateAESKeys");
const mongoose = require("mongoose");
const { emailAlert, arEmailAlert } = require("../templates/enMail");
const Categories = require('../../models/categories');
const { numberToArabic } = require('number-to-arabic');

exports.getPublisherAdInsights = asyncHandler(async (req, res, next) => {
  try {
    let ads_with_insights_counts = [];
    const ads = await Ads.find();
    const clicks = await Clicks.find();
    const views = await Views.find();
    const impressions = await Impressions.find();
    const user_package = await UserPackage.find();
    const packages = await Packages.find();

    const month = req.params.month
    const year = req.params.year

    for (let i = 0; i < ads.length; i++) {
      if (ads[i].createdAt.getMonth() + 1 == month && ads[i].createdAt.getFullYear() == year) {
        let extract_ad_click = clicks.filter(c => c.ad_id == ads[i].id && c.createdAt.getMonth() + 1 == month && c.createdAt.getFullYear() == year);
        let extract_ad_views = views.filter(c => c.ad_id == ads[i].id && c.createdAt.getMonth() + 1 == month && c.createdAt.getFullYear() == year);
        let extract_ad_impressions = impressions.filter(c => c.ad_id == ads[i].id && c.createdAt.getMonth() + 1 == month && c.createdAt.getFullYear() == year);
        let user_package_ = user_package.filter(c => c.id == ads[i].user_package_id);
        // console.log(user_package_[0])
        if (!(user_package_[0] == undefined)) {
          ads_with_insights_counts.push({
            ad_id: ads[i].id,
            title: ads[i].title,
            file: ads[i].file,
            user_id: ads[i].user_id,
            link: ads[i].link,
            type: ads[i].type,
            createdAt: ads[i].createdAt,
            user_package: user_package_[0].package_name,
            total_clicks: extract_ad_click.length,
            total_views: extract_ad_views.length,
            total_impressions: extract_ad_impressions.length
          })
        }
      }
    }

    var lastDay = new Date(year, month, 0);

    let count_with_eactDay = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      // console.log(i)
      var total_clicks = await clicks.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
      var total_views = await views.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
      var total_impressions = await impressions.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
      count_with_eactDay.push({ date: i, counts: [total_clicks.length, total_views.length, total_impressions.length] })
    }

    let packages_with_insights = [];
    for (let package of packages) {
      let package_number = await user_package.filter(m => m.package_id == package.id)
      packages_with_insights.push({ package_name: package.name, total: package_number.length })
    }
    const revenue = await Revenue.find();
    let total_revenue = 0;
    for (let rev of revenue) {
      total_revenue += rev.amount
    }

    // let ads__ = await Ads.aggregate([
    //   { "$match": { "_id": mongoose.Types.ObjectId(user_id) } },
    //   {
    //     $lookup: {
    //       from: "clicks",
    //       localField: "_id",
    //       foreignField: "ad_id",
    //       as: "clicks"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "views",
    //       localField: "_id",
    //       foreignField: "ad_id",
    //       as: "views"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "impressions",
    //       localField: "_id",
    //       foreignField: "ad_id",
    //       as: "impressions"
    //     }
    //   },
    // ]);




    let resp = {
      status: 200,
      total_revenue,
      overall_clicks: clicks.length,
      overall_views: views.length,
      overall_impressions: impressions.length,
      count: ads_with_insights_counts.length,
      ads_with_insights_counts,
      count_with_eactDay,
      packages_with_insights
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
    res.status(500).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.getPublisherPackage = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let publisher_package = [];
    const userPackage = await UserPackage.findOne({ user_id: cred.user_id });
    publisher_package.push({
      _id: userPackage._id,
      package_name: userPackage.package_name,
      package_arname: userPackage.package_arname,
      total_ads: userPackage.ads_count,
      createdAt: userPackage.createdAt,
      expiresAt: userPackage.expiresAt,
      approvedAt: userPackage.approvedAt,
      status: userPackage.status,
      user_name: userPackage.user_name,
      package_id: userPackage.package_id
    })

    let resp = {
      status: 200,
      publisher_package
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
exports.dashBoard = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find();
    let active_users_list = [];
    let pending_users_list = [];

    for (let i = 0; i < users.length; i++) {
      if (users[i].roll == "User" && users[i].status == "Approved") {
        active_users_list.push(users[i]);
      } else if (users[i].roll == "User" && users[i].status == "Pending") {
        pending_users_list.push(users[i]);
      }
    }
    const ads = await Ads.find({ status: 'Pending' });
    // const most_popular_ads__ = await Ads.find();
    // let most_popular_ads_ = await most_popular_ads__.filter(m => m.status !== "Pending" && m.status !== "Blocked");

    // const clicks = await Clicks.find();
    // const most_popular_ads = [];
    // // console.log(most_popular_ads_);

    // for (let i = 0; i < most_popular_ads_.length; i++) {
    //   let most_clicks = await clicks.filter(m => m.ad_id == most_popular_ads_[i].id);
    //   most_popular_ads.push({ ad: most_popular_ads_[i], clicks: most_clicks.length });
    // }



    // // let max_clicks = most_popular_ads[0];
    // for (let i = 0; i < most_popular_ads.length; i++) {
    //   // console.log(most_popular_ads[i].ad.title);
    //   let max_clicks = most_popular_ads[i]
    //   for (let j = i; j < most_popular_ads.length; j++) {
    //     if (most_popular_ads[j].clicks > max_clicks.clicks) {
    //       max_clicks = most_popular_ads[j];
    //       most_popular_ads[j] = most_popular_ads[i]
    //       most_popular_ads[i] = max_clicks
    //     }
    //   }
    // }

    const recent_package_requests = await UserPackage.find({ status: 'Pending' }).sort({ createdAt: -1 });
    const revenue = await Revenue.find();
    let total_revenue = 0;
    for (let i = 0; i < revenue.length; i++) {
      total_revenue = total_revenue + revenue[i].amount
    }

    let ads__ = await Ads.aggregate([
      {
        $lookup: {
          from: "clicks",
          localField: "_id",
          foreignField: "ad_id",
          as: "clicks"
        }
      },
    ]);

    let resp = {
      status: 200,
      active_users_count: active_users_list.length,
      pending_users_count: pending_users_list.length,
      // pending_users: pending_users_list,
      ads,
      most_popular_ads: ads__,
      recent_package_requests,
      total_revenue
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 200,
      message: 'Error while fetching data',
      armessage: 'خطأ أثناء جلب البيانات'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.transactions = asyncHandler(async (req, res, next) => {
  try {
    const transactions = await Transaction.find();
    const users = await User.find();
    let count = transactions.length;

    let users_ids_list = [];
    let users_ids_list_unique = [];
    let users_with_count_list = [];
    let users_with_count_and_name = [];

    // Extract all unique id's

    if (transactions) {
      for (let i = 0; i < count; i++) {
        users_ids_list.push(transactions[i].user_id);
      }
      users_ids_list_unique = [...new Set(users_ids_list)];
    }

    // Transaction count against unique id's

    for (let i = 0; i < users_ids_list_unique.length; i++) {
      let count_against_id = 0;
      for (let j = 0; j < count; j++) {
        if (transactions[j].user_id === users_ids_list_unique[i]) {
          count_against_id++;
        }
      }
      users_with_count_list.push({
        user_id: users_ids_list_unique[i],
        count: count_against_id,
      });
    }

    // Name against Extracted user IDs

    for (let i = 0; i < users_with_count_list.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (users_with_count_list[i].user_id == users[j].id) {
          users_with_count_and_name.push({
            name: users[j].firstname + " " + users[j].lastname,
            id: users[j].id,
            email: users[j].email,
            status: users[j].status,
            count: users_with_count_list[i].count,
          });
        }
      }
    }

    if (users_ids_list.length > 0) {

      res.status(200).json({
        status: 200,
        users: users_with_count_and_name,
      });
    }
  } catch (err) {
    res.status(200).json({
      status: 200,
      message: err.message,
    });
  }
});
exports.bills = asyncHandler(async (req, res, next) => {
  try {
    const bills = await Bills.find();

    const users = await User.find();
    let count = bills.length;

    let users_ids_list = [];
    let users_ids_list_unique = [];
    let users_with_count_list = [];
    let users_with_count_and_name = [];

    // Extract all unique id's

    if (bills) {
      for (let i = 0; i < count; i++) {
        users_ids_list.push(bills[i].user_id);
      }
      users_ids_list_unique = [...new Set(users_ids_list)];
    }

    // bills count against unique id's

    for (let i = 0; i < users_ids_list_unique.length; i++) {
      let count_against_id = 0;
      for (let j = 0; j < count; j++) {
        if (bills[j].user_id === users_ids_list_unique[i]) {
          count_against_id++;
        }
      }
      users_with_count_list.push({
        user_id: users_ids_list_unique[i],
        count: count_against_id,
      });
    }

    // Name against Extracted user IDs

    for (let i = 0; i < users_with_count_list.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (users_with_count_list[i].user_id == users[j].id) {
          users_with_count_and_name.push({
            name: users[j].firstname + " " + users[j].lastname,
            id: users[j].id,
            email: users[j].email,
            status: users[j].status,
            count: users_with_count_list[i].count,
          });
        }
      }
    }

    if (users_ids_list.length > 0) {
      res.status(200).json({
        status: 200,
        users: users_with_count_and_name,
      });
    }
  } catch (err) {
    res.status(200).json({
      status: 200,
      message: err.message,
    });
  }
});
exports.allBills = asyncHandler(async (req, res, next) => {
  try {
    const bills = await Bills.find({ user_id: req.params.id });
    if (bills) {
      res.status(200).json({
        status: 200,
        users: bills,
      });
    }
  } catch (err) {
    res.status(200).json({
      status: 200,
      message: err.message,
    });
  }
});
exports.alltransactions = asyncHandler(async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user_id: req.params.id });
    if (transactions) {
      res.status(200).json({
        status: 200,
        users: transactions,
      });
    }
  } catch (err) {
    res.status(200).json({
      status: 200,
      message: err.message,
    });
  }
});
exports.sendMessage = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const users = await User.find();
    if (users.length > 0) {
      let { message, armessage, subject, arsubject } = cred;
      for (let i = 0; i < users.length; i++) {
        if (users[i].language == "ar") {
          const messages = await Message.create({
            user_id: users[i].id,
            body: message,
            arsubject,
            armessage,
            subject: subject,
          });
          // mail options
          let mailOptions = {
            from: process.env.EMAIL,
            to: users[i].email,
            subject: 'اشعارات مصون',
            html: arEmailAlert(users[i].firstname + ' ' + users[i].lastname, armessage, `تنبيه`)
          };
          sendEmailByAdmin(mailOptions);

          if (!(users[i].playerId == undefined || users[i].playerId == 'disabled')) {
            var mes = {
              app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
              contents: { en: "لديك رسالة جديدة من Masoon" },
              include_player_ids: [users[i].playerId]
            };
            pushNot.sendNotification(mes);
          }
        } else {
          const messages = await Message.create({
            user_id: users[i].id,
            body: message,
            armessage,
            arsubject,
            subject: subject,
          });
          // mail options
          let mailOptions = {
            from: process.env.EMAIL,
            to: users[i].email,
            subject: 'Masoon Notification',
            html: emailAlert(users[i].firstname + ' ' + users[i].lastname, message, 'Masoon Notification')
          };
          sendEmailByAdmin(mailOptions);

          if (!(users[i].playerId == undefined || users[i].playerId == 'disabled')) {
            var mes = {
              app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
              contents: { en: "You have a new Message from Masoon" },
              include_player_ids: [users[i].playerId]
            };
            pushNot.sendNotification(mes);
          }
        }
      }
      let resp = {
        status: 200,
        message: "Public message sent",
        armessage: 'تم إرسال رسالة عامة'
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    } else {
      let resp = {
        status: 200,
        message: "Currently there are no users in Masoon",
        armessage: `حاليا لا يوجد مستخدمين لتطبيق مصون`
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while sending message",
      armessage: 'خطأ أثناء إرسال الرسالة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.sendAlertForBills = asyncHandler(async (req, res, next) => {
  try {
    let date = new Date();
    let today = date.getDate();
    let this_month = date.getMonth() + 1;
    let this_year = date.getFullYear();
    let notification_exists = false;
    const all_notifications = await Notification.find({ user_id: req.user.id })
    const bills_reached_last_date = await Bills.find({ user_id: req.user.id });
    if (bills_reached_last_date.length > 0) {
      for (let i = 0; i < bills_reached_last_date.length; i++) {
        if (bills_reached_last_date[i].due_date.getDate() == today
          && bills_reached_last_date[i].due_date.getMonth() + 1 == this_month
          && bills_reached_last_date[i].due_date.getFullYear() == this_year) {
          notification_exists = false
          for (let j = 0; j < all_notifications.length; j++) {
            if (all_notifications[j].bill_id == bills_reached_last_date[i].id) {
              notification_exists = true;
            }
          }
          if (notification_exists == false) {
            if (req.user.language == 'en') {
              // console.log(req.user)
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `Today is the last date for the payment of ${bills_reached_last_date[i].name} bill` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'Team Masoon',
                html: emailAlert(users[i].firstname + ' ' + users[i].lastname, `Today is the last date for the payment of ${bills_reached_last_date[i].name} bill`, 'Bill Alert')

              };
              sendEmailByAdmin(mailOptions);
              const alert_for_last_date_of_Bill = await Notification.create({
                user_id: req.user.id,
                body: `bill: ${bills_reached_last_date[i].name}, amount: ${bills_reached_last_date[i].amount} , last_date: ${bills_reached_last_date[i].due_date}`,
                subject: 'Bill Alert',
                arbody: `فاتورة: ${bills_reached_last_date[i].name}, كمية: ${numberToArabic(bills_reached_last_date[i].amount)} , اخر موعد: ${bills_reached_last_date[i].due_date}`,
                arsubject: 'تنبيه الفاتورة',
                bill_id: bills_reached_last_date[i].id
              });
            } else {
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `اليوم هو آخر موعد لدفع فاتورة ${bills_reached_last_date[i].name}`, },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }

              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'تنبيه الفاتورة',
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, `اليوم هو آخر موعد لدفع فاتورة ${bills_reached_last_date[i].name}`)
              };
              sendEmailByAdmin(mailOptions);

              const alert_for_last_date_of_Bill = await Notification.create({
                user_id: req.user.id,
                body: `bill: ${bills_reached_last_date[i].name}, amount: ${bills_reached_last_date[i].amount} , last_date: ${bills_reached_last_date[i].due_date}`,
                subject: 'Bill Alert',
                arbody: `فاتورة: ${bills_reached_last_date[i].name}, كمية: ${numberToArabic(bills_reached_last_date[i].amount)} , اخر موعد: ${bills_reached_last_date[i].due_date}`,
                arsubject: 'تنبيه الفاتورة',
                bill_id: bills_reached_last_date[i].id
              });
            }
          }
        }
      }

      for (let i = 0; i < bills_reached_last_date.length; i++) {
        if (bills_reached_last_date[i].due_date.getDate() + 1 < date.getDate()
          && bills_reached_last_date[i].due_date.getMonth() < date.getMonth()
          && bills_reached_last_date[i].due_date.getFullYear() < date.getFullYear()
        ) {
          // console.log(bills_reached_last_date[i].due_date.getDate() + 1);
          notification_exists = false;
          for (let j = 0; j < all_notifications.length; j++) {
            if (all_notifications[j].bill_id == bills_reached_last_date[i].id && all_notifications[j].subject == 'Bill Alert Overdue') {
              notification_exists = true;
            }
          }
          if (notification_exists == false) {
            if (req.user.language == 'ar') {
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled' || req.user.playerId == null)) {
                var token = req.user.device_id;
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `فاتورة ${bills_reached_last_date[i].name} الخاصة بك متأخرة` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              let arMessage = `فاتورة ${bills_reached_last_date[i].name} الخاصة بك متأخرة`
              let arSubject = `فريق ميسون`
              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: arSubject,
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, arSubject)
              };
              sendEmailByAdmin(mailOptions);
              const alert_for_last_date_of_Bill = await Notification.create({
                user_id: req.user.id,
                body: `bill: ${bills_reached_last_date[i].name}, amount: ${bills_reached_last_date[i].amount} , last_date: ${bills_reached_last_date[i].due_date}`,
                subject: 'Bill Alert Overdue',
                arbody: `فاتورة: ${bills_reached_last_date[i].name}, كمية: ${numberToArabic(bills_reached_last_date[i].amount)} , اخر موعد: ${bills_reached_last_date[i].due_date}`,
                arsubject: 'تنبيه فاتورة متأخرة',
                bill_id: bills_reached_last_date[i].id
              });
            } else {
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled' || req.user.playerId == null)) {
                var token = req.user.device_id;
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `Your ${bills_reached_last_date[i].name} bill is over due` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              let enMessage = `Your ${bills_reached_last_date[i].name} bill is over due`
              let enSubject = 'Team Masoon'
              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: arSubject,
                html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject)
              };
              sendEmailByAdmin(mailOptions);
              const alert_for_last_date_of_Bill = await Notification.create({
                user_id: req.user.id,
                body: `bill: ${bills_reached_last_date[i].name}, amount: ${bills_reached_last_date[i].amount} , last_date: ${bills_reached_last_date[i].due_date}`,
                subject: 'Bill Alert Overdue',
                arbody: `فاتورة: ${bills_reached_last_date[i].name}, كمية: ${numberToArabic(bills_reached_last_date[i].amount)} , اخر موعد: ${bills_reached_last_date[i].due_date}`,
                arsubject: 'تنبيه فاتورة متأخرة',
                bill_id: bills_reached_last_date[i].id
              });
            }
          }
        }
      }

      res.status(200).json({
        status: 200,
        notification: 'Bill alert sent',
        armessage: 'تم إرسال تنبيه الفاتورة'
      });
    }
    else if (bills_reached_last_date.length == 0) {
      res.status(200).json({
        status: 200,
        notification: 'No bills found',
        armessage: 'لم يتم العثور على فواتير'
      });
    }

  } catch (err) {
    next(err);
    res.status(200).json({
      status: 200,
      message: 'Error while notifying',
      armessage: `خطأ أثناء الإشعار`
    });
  }
});
exports.sendBudgetAlert = asyncHandler(async (req, res, next) => {
  try {
    console.log('11111111111111111111111111111111111111')
    let months_names = ['january', 'february', 'march', 'april', 'may', 'june'
      , 'july', 'august', 'september', 'october', 'november', 'december'];
    let budgets = await Budget.find(
      {
        user_id: req.user.id,
        month: months_names[new Date().getMonth()],
        year: new Date().getFullYear(),
      });
    if (budgets) {
      for (let i = 0; i < budgets.length; i++) {
        let remPercentage = Math.ceil((budgets[i].remaining_amount / budgets[i].amount) * 100);
        let arCategory = await Categories.findOne({ name: budgets[i].category_id });
        if (remPercentage <= 50 && remPercentage > 30 && budgets[i].notified_for_half != true) {
          if (req.user.language == "ar") {

            if (arCategory) {
              let arMessage = `تم استخدام 50% من ميزانية ${arCategory.arname}`
              var mes = {
                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                contents: { en: arMessage },
                include_player_ids: [req.user.playerId]
              };
              pushNot.sendNotification(mes);
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'تنبيه الميزانية',
                body: `تم استخدام ٥۰٪ من ميزانيتك ${arCategory.arname}`,
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, `تنبيه الميزانية`),
              };
              sendEmailByAdmin(mailOptions);
              const alert_for_last_date_of_Budget = await Notification.create({
                user_id: req.user.id,
                body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
                subject: `Your ${budgets[i].category_id} Budget is 50% utilized`,
                arbody: `ميزانية ${arCategory.arname} ، المبلغ ${numberToArabic(budgets[i].remaining_amount)} ، المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
                arsubject: `تم استخدام ٥۰%  ${arCategory.arname} من ميزانية`,
                budget_id: budgets[i].id
              });
              let updateForHalfNotified = await Budget.findByIdAndUpdate(
                { _id: budgets[i].id },
                { notified_for_half: true },
                { new: true, useFindAndModify: false }
              )
            }
          } else {
            var mes = {
              app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
              contents: { en: `Your ${budgets[i].category_id} Budget is 50% utilized` },
              include_player_ids: [req.user.playerId]
            };
            pushNot.sendNotification(mes);

            let enMessage = `Your ${budgets[i].category_id} Budget is 50% utilized`;
            let enSubject = 'Budget Alert'
            let mailOptions = {
              from: process.env.EMAIL,
              to: req.user.email,
              subject: enSubject,
              html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
            };
            sendEmailByAdmin(mailOptions)
            const alert_for_last_date_of_Budget = await Notification.create({
              user_id: req.user.id,
              body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
              subject: 'Budget Alert',
              arbody: `ميزانية ${arCategory.arname} ، المبلغ ${numberToArabic(budgets[i].remaining_amount)} ، المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
              arsubject: `تم استخدام 50% من ميزانية ${arCategory.arname}`,
              budget_id: budgets[i].id
            });

            let updateForHalfNotified = await Budget.findByIdAndUpdate(
              { _id: budgets[i].id },
              { notified_for_half: true },
              { new: true, useFindAndModify: false }
            )
          }
        } else if (remPercentage <= 30 && remPercentage > 10 && budgets[i].notified_for_quarter != true) {
          if (req.user.language == "ar") {
            let arCategory = await Categories.findOne({ name: budgets[i].category_id });
            if (arCategory) {
              let arMessage = `تم استخدام 70% من ميزانية ${arCategory.arname}`;
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: arMessage },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'تنبيه الميزانية',
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, arMessage, `تنبيه الميزانية`)
              };
              sendEmailByAdmin(mailOptions);

              const alert_for_last_date_of_Budget = await Notification.create({
                user_id: req.user.id,
                body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
                subject: `Your ${budgets[i].category_id} Budget 70% utilized`,
                arbody: `ميزانية: ${arCategory.arname}, كمية ${numberToArabic(budgets[i].remaining_amount)}, المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
                arsubject: arMessage,
                budget_id: budgets[i].id
              });
              let updateForHalfNotified = await Budget.findByIdAndUpdate(
                { _id: budgets[i].id },
                { notified_for_quarter: true },
                { new: true, useFindAndModify: false }
              )
            }
          } else {
            if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
              var mes = {
                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                contents: { en: `Your ${budgets[i].category_id} Budget 70% utilized` },
                include_player_ids: [req.user.playerId]
              };
              pushNot.sendNotification(mes);
            }
            let enMessage = `Your ${budgets[i].category_id} Budget 70% utilized`;
            let enSubject = 'Budget Alert'
            let mailOptions = {
              from: process.env.EMAIL,
              to: req.user.email,
              subject: enSubject,
              html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
            };
            sendEmailByAdmin(mailOptions);
            const alert_for_last_date_of_Budget = await Notification.create({
              user_id: req.user.id,
              body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
              subject: `Your ${budgets[i].category_id} Budget 70% utilized`,
              arbody: `ميزانية ${arCategory.arname}, كمية ${numberToArabic(budgets[i].remaining_amount)}, المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
              arsubject: `تم استخدام 70% من ميزانية ${arCategory.arname}`,
              budget_id: budgets[i].id
            });
            let updateForHalfNotified = await Budget.findByIdAndUpdate(
              { _id: budgets[i].id },
              { notified_for_quarter: true },
              { new: true, useFindAndModify: false }
            )
          }
        } else if (remPercentage <= 10 && budgets[i].notified_for_last != true) {
          if (req.user.language == "ar") {
            let arCategory = await Categories.findOne({ name: budgets[i].category_id });
            if (arCategory) {
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `تم استخدام 90% من ميزانية ${arCategory.arname}` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              // mail options
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: 'تنبيه الميزانية',
                html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, `تم استخدام 90% من ميزانية ${arCategory.arname}`,)
              };
              sendEmailByAdmin(mailOptions);

              const alert_for_last_date_of_Budget = await Notification.create({
                user_id: req.user.id,
                body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
                subject: `Your ${budgets[i].category_id} Budget 90% utilized`,
                arbody: `ميزانية ${arCategory.arname}, كمية ${numberToArabic(budgets[i].remaining_amount)}, المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
                arsubject: `تم استخدام 90% من ميزانية ${arCategory.arname}`,
                budget_id: budgets[i].id
              });
              let updateForHalfNotified = await Budget.findByIdAndUpdate(
                { _id: budgets[i].id },
                { notified_for_last: true },
                { new: true, useFindAndModify: false }
              )
            }
          } else {
            if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
              var mes = {
                app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                contents: { en: `Your ${budgets[i].category_id} Budget 90% utilized` },
                include_player_ids: [req.user.playerId]
              };
              pushNot.sendNotification(mes);
            }
            let enMessage = `Your ${budgets[i].category_id} Budget 90% utilized`;
            let enSubject = 'Budget Alert'
            let mailOptions = {
              from: process.env.EMAIL,
              to: req.user.email,
              subject: enSubject,
              html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
            };
            sendEmailByAdmin(mailOptions);
            const alert_for_last_date_of_Budget = await Notification.create({
              user_id: req.user.id,
              body: `Budget ${budgets[i].category_id}, Amount ${budgets[i].remaining_amount}, Total_amount ${budgets[i].amount}`,
              subject: `Your ${budgets[i].category_id} Budget 90% utilized`,
              arbody: `ميزانية ${arCategory.arname}, كمية ${numberToArabic(budgets[i].remaining_amount)}, المبلغ الإجمالي ${numberToArabic(budgets[i].amount)}`,
              arsubject: `تم استخدام 90% من ميزانية ${arCategory.arname}`,
              budget_id: budgets[i].id
            });
            let updateForHalfNotified = await Budget.findByIdAndUpdate(
              { _id: budgets[i].id },
              { notified_for_last: true },
              { new: true, useFindAndModify: false }
            )
          }
        }
      }
    } else {
      let resp = {
        status: 400,
        message: "Error while fetching data",
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }

  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data"
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.sendBudgetAlert1 = asyncHandler(async (req, res, next) => {
  try {
    let notification_exists = false;
    const all_notifications = await Notification.find({ user_id: req.user.id })
    const budgets_with_low_balance = await Budget.find({ user_id: req.user.id });
    if (budgets_with_low_balance.length > 0) {
      for (let i = 0; i < budgets_with_low_balance.length; i++) {
        var percentage = (budgets_with_low_balance[i].remaining_amount / budgets_with_low_balance[i].amount) * 100
        if (percentage <= 50 && percentage > 30) {
          notification_exists = false
          for (let j = 0; j < all_notifications.length; j++) {
            if (all_notifications[j].budget_id == budgets_with_low_balance[i].id) {
              notification_exists = true;
            }
          }
          if (notification_exists == false) {
            if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
              if (req.user.language == "ar") {
                let arCategory = await Categories.findOne({ name: budgets_with_low_balance[i].category_id })
                if (arCategory) {
                  var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `يتم استخدام${arCategory.arname} ٥۰% من ميزانية` },
                    include_player_ids: [req.user.playerId]
                  };
                  pushNot.sendNotification(mes);
                  let mailOptions = {
                    from: process.env.EMAIL,
                    to: req.user.email,
                    subject: 'تنبيه الميزانية',
                    body: `تم استخدام ٥۰٪ من ميزانيتك ${arCategory.arname}`,
                    html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, `يتم استخدام${arCategory.arname} ٥۰% من ميزانيتك`, 'تنبيه الميزانية'),
                  };
                  sendEmailByAdmin(mailOptions);
                  const alert_for_last_date_of_Budget = await Notification.create({
                    user_id: req.user.id,
                    body: `budget: ${budgets_with_low_balance[i].category_id}, amount: ${budgets_with_low_balance[i].remaining_amount}, total_amount: ${budgets_with_low_balance[i].amount}`,
                    subject: 'Budget Alert',
                    arbody: `الميزانية: ${arCategory.arname} ، المبلغ: ${numberToArabic(budgets_with_low_balance[i].remaining_amount)} ، المبلغ الإجمالي: ${numberToArabic(budgets_with_low_balance[i].amount)}`,
                    arsubject: 'تنبيه الميزانية',
                    budget_id: budgets_with_low_balance[i].id
                  });
                }
              } else {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `Your ${budgets_with_low_balance[i].category_id} Budget is 50% utilized` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);

                let enMessage = `Your ${budgets_with_low_balance[i].category_id} Budget is 50% utilized`;
                let enSubject = 'Team Masoon'
                let mailOptions = {
                  from: process.env.EMAIL,
                  to: req.user.email,
                  subject: enSubject,
                  html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
                };
                sendEmailByAdmin(mailOptions)
                const alert_for_last_date_of_Budget = await Notification.create({
                  user_id: req.user.id,
                  body: `budget: ${budgets_with_low_balance[i].category_id}, amount: ${budgets_with_low_balance[i].remaining_amount}, total_amount: ${budgets_with_low_balance[i].amount}`,
                  subject: 'Budget Alert',
                  arbody: `الميزانية: ${arCategory.arname} ، المبلغ: ${numberToArabic(budgets_with_low_balance[i].remaining_amount)} ، المبلغ الإجمالي: ${numberToArabic(budgets_with_low_balance[i].amount)}`,
                  arsubject: 'تنبيه الميزانية',
                  budget_id: budgets_with_low_balance[i].id
                });
              }
            }
          }
        }
        else if (percentage <= 30) {
          notification_exists = false
          for (let j = 0; j < all_notifications.length; j++) {
            if (all_notifications[j].budget_id == budgets_with_low_balance[i].id) {
              notification_exists = true;
            }
          }
          if (notification_exists == false) {
            if (req.user.language == "ar") {
              let arCategory = await Categories.findOne({ name: budgets_with_low_balance[i].category_id });
              if (arCategory) {
                if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                  var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `يتم استخدام${arCategory.arname} %۷۰ من ميزانيتك` },
                    include_player_ids: [req.user.playerId]
                  };
                  pushNot.sendNotification(mes);
                }
                // mail options
                let mailOptions = {
                  from: process.env.EMAIL,
                  to: req.user.email,
                  subject: 'تنبيه الميزانية',
                  html: arEmailAlert(req.user.firstname + ' ' + req.user.lastname, `يتم استخدام${arCategory.arname} %۷۰ من ميزانيتك`,)
                };
                sendEmailByAdmin(mailOptions);

                const alert_for_last_date_of_Budget = await Notification.create({
                  user_id: req.user.id,
                  body: `budget: ${budgets_with_low_balance[i].category_id}, amount: ${budgets_with_low_balance[i].remaining_amount}, total_amount: ${budgets_with_low_balance[i].amount}`,
                  subject: 'Budget Alert',
                  body: `ميزانية: ${arCategory.arname}, كمية: ${numberToArabic(budgets_with_low_balance[i].remaining_amount)}, المبلغ الإجمالي: ${numberToArabic(budgets_with_low_balance[i].amount)}`,
                  subject: 'تنبيه الميزانية',
                  budget_id: budgets_with_low_balance[i].id
                });
              }

            } else {
              if (!(req.user.playerId == undefined || req.user.playerId == 'disabled')) {
                var mes = {
                  app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                  contents: { en: `Your ${budgets_with_low_balance[i].category_id} Budget 70% utilized` },
                  include_player_ids: [req.user.playerId]
                };
                pushNot.sendNotification(mes);
              }
              let enMessage = `Your ${budgets_with_low_balance[i].category_id} Budget 70% utilized`;
              let enSubject = 'Team Masoon'
              let mailOptions = {
                from: process.env.EMAIL,
                to: req.user.email,
                subject: enSubject,
                html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMessage, enSubject),
              };
              sendEmailByAdmin(mailOptions);
              const alert_for_last_date_of_Budget = await Notification.create({
                user_id: req.user.id,
                body: `budget: ${budgets_with_low_balance[i].category_id}, amount: ${budgets_with_low_balance[i].remaining_amount}, total_amount: ${budgets_with_low_balance[i].amount}`,
                subject: 'Budget Alert',
                body: `ميزانية: ${arCategory.arname}, كمية: ${numberToArabic(budgets_with_low_balance[i].remaining_amount)}, المبلغ الإجمالي: ${numberToArabic(budgets_with_low_balance[i].amount)}`,
                subject: 'تنبيه الميزانية',
                budget_id: budgets_with_low_balance[i].id
              });

            }
          }
        }
      }
      res.status(200).json({
        status: 200,
        notification: 'Budget alert sent',
        armessage: 'تم إرسال تنبيه الميزانية'
      });
    }
    else if (budgets_with_low_balance.length == 0) {
      res.status(200).json({
        status: 200,
        notification: 'Budget not found',
        armessage: 'الميزانية غير موجودة'
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 200,
      message: 'Error while notifying',
      armessage: `خطأ أثناء الإشعار`
    });
  }
});
exports.sendNotification = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let { message, subject, email, user_id } = cred;
    const user = await User.findById({ _id: user_id });
    const notification = await Notification.create({
      user_id: user_id,
      body: message,
      subject: subject,
      email: email
    });

    if (!(user.playerId == undefined || req.user.playerId == 'disabled')) {
      var mes = {
        app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
        contents: { en: `${message}` },
        include_player_ids: [user.playerId]
      };
      pushNot.sendNotification(mes);
    }
    // mail options
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Team Masoon',
      html: emailAlert(user.firstname + ' ' + user.lastname, message, 'Team Masoon')
    };
    sendEmailByAdmin(mailOptions);

    let resp = {
      status: 200,
      message: "Notification sent",
      armessage: 'تم إرسال الاشعار'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 200,
      message: "Error while sending notification",
      armessage: `خطأ أثناء إرسال الإشعار`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.getMessage = asyncHandler(async (req, res, next) => {
  try {
    const messages = await Message.find({ user_id: req.user.id });
    let resp = {
      status: 200,
      messages: messages
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data",
      armessage: 'خطأ أثناء جلب البيانات'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.activeStatus = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let { id } = cred;
    const user = await User.findByIdAndUpdate({ _id: id }, { active: true }, { new: true, useFindAndModify: false });
    res.status(200).json({
      status: 200,
      message: 'User marked “Active”',
      armessage: `تمت الإشارة للمستخدم بـ "نشط"`
    })
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: 'Error while processing',
      armessage: 'خطأ أثناء المعالجة'
    })
  }
});
exports.offlineStatus = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));

    const user = await User.findByIdAndUpdate({ _id: req.user.id }, { active: false }, { new: true, useFindAndModify: false });
    let resp = {
      status: 200,
      message: 'User marked "Offline"',
      armessage: `تمت الإشارة للمستخدم بـ "غير متصل"`
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
    res.status(500).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.createUserByAdmin = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const { firstname, lastname, email, phone_number, password, confirmPassword } = cred;
    if (firstname == '' || lastname == '' || email == '' || phone_number == '' || password == ''
      || confirmPassword == ''
      || firstname == null || lastname == null || email == null || phone_number == null
      || password == null || confirmPassword == null
      || firstname == undefined || lastname == undefined || email == undefined || phone_number == undefined
      || password == undefined || confirmPassword == undefined) {
      let resp = {
        status: 400,
        message: 'Please provide all the credentials to create a user account',
        armessage: `يرجى تقديم جميع بيانات الاعتماد لإنشاء حساب مستخدم`
      }
      res.status(200).json({
        resp
      })
    } else if (password != confirmPassword) {
      let resp = {
        status: 400,
        message: `Your passwords don't match`,
        armessage: `كلمتي السر غير متطابقتين`
      }
      res.status(200).json({
        resp
      })
    } else {
      const checkEmail = await User.find({ email: email });
      const checkPhone = await User.find({ phone_number: phone_number });

      if (checkPhone.length > 0) {
        let resp = {
          status: 400,
          message: "Phone number already exists, please select another different Phone number",
          armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      } else if (checkEmail.length > 0) {
        let resp = {
          status: 400,
          message: "Email already exists, please choose a different email",
          armessage: `البريد الالكتروني مُستخدم مسبقاً، يرجى اختيار بريد إلكتروني مختلف`
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        });
      } else {
        const newUser = await User.create({
          firstname,
          lastname,
          email,
          password,
          phone_number
        });

        let enMessage = `You can login to masoon using email: ${email} and password: ${password}`
        let enSubject = 'Team Masoon'
        let mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: enSubject,
          html: emailAlert(newUser.firstname + ' ' + newUser.lastname, enMessage, enSubject)
        };
        sendEmailByAdmin(mailOptions);
        let resp = {
          status: 200,
          message: 'User created successfully',
          armessage: 'تم إنشاء المستخدم بنجاح'
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
      message: 'Error while creating user',
      armessage: 'خطأ أثناء إنشاء المستخدم'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.editUserCredentialByAdmin = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const { firstname, lastname, email, password, phone_number, user_id } = cred;
    const user = await User.findById({ _id: user_id });
    if (user.email !== email) {
      const check_email = await User.find({ email: email });
      if (check_email.length > 0) {

        let resp = {
          status: 200,
          message: 'Email already taken. Please select another different email',
          armessage: `البريد الالكتروني مُستخدم مسبقاً، يرجى اختيار بريد إلكتروني مختلف`
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        });
      } else {
        if (user.phone_number !== phone_number) {
          const phone_check = await User.find({ phone_number: phone_number });
          if (phone_check.length > 0) {

            let resp = {
              status: 200,
              message: 'Phone Number already taken. Please select another Phone Number',
              armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر، يرجى ادخال رقم هاتف آخر`
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            });
          } else {
            if (user.firstname !== firstname) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { firstname: firstname },
                { new: true, useFindAndModify: false }
              );
            }
            if (user.lastname !== lastname) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { lastname: lastname },
                { new: true, useFindAndModify: false }
              );
            }
            if (user.email !== email) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { email: email },
                { new: true, useFindAndModify: false }
              );
            }
            if (user.phone_number !== phone_number) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { phone_number: phone_number },
                { new: true, useFindAndModify: false }
              );
            }
            if (password !== '') {
              const isMatch = await user.matchPassword(password);
              if (!isMatch) {
                const updateUser = await User.findByIdAndUpdate(
                  { _id: user_id },
                  { password: password },
                  { new: true, useFindAndModify: false }
                );
              }

              let resp = {
                status: 200,
                message: 'User details updated successfully',
                armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
              }
              res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
              })
            }
          }
        } else {
          if (user.firstname !== firstname) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { firstname: firstname },
              { new: true, useFindAndModify: false }
            );
          }
          if (user.lastname !== lastname) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { lastname: lastname },
              { new: true, useFindAndModify: false }
            );
          }
          if (user.email !== email) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { email: email },
              { new: true, useFindAndModify: false }
            );
          }
          if (password !== '') {
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { password: password },
                { new: true, useFindAndModify: false }
              );
            }
            let resp = {
              status: 200,
              message: 'User details updated successfully.'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            })

          } else {
            let resp = {
              status: 200,
              message: 'User details updated successfully',
              armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            })
          }
        }
      }
    } else {
      if (user.phone_number !== phone_number) {
        const phone_check = await User.find({ phone_number: phone_number });
        if (phone_check.length > 0) {

          let resp = {
            status: 200,
            message: 'Phone Number already taken. Please select another Phone Number',
            armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر، يرجى ادخال رقم هاتف آخر`
          }
          res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
          });
        } else {
          if (user.firstname !== firstname) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { firstname: firstname },
              { new: true, useFindAndModify: false }
            );
          }
          if (user.lastname !== lastname) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { lastname: lastname },
              { new: true, useFindAndModify: false }
            );
          }
          if (user.email !== email) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { email: email },
              { new: true, useFindAndModify: false }
            );
          }
          if (user.phone_number !== phone_number) {
            const updateUser = await User.findByIdAndUpdate(
              { _id: user_id },
              { phone_number: phone_number },
              { new: true, useFindAndModify: false }
            );
          }
          if (password !== '') {
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
              const updateUser = await User.findByIdAndUpdate(
                { _id: user_id },
                { password: password },
                { new: true, useFindAndModify: false }
              );
            }

            let resp = {
              status: 200,
              message: 'User details updated successfully',
              armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            })
          } else {
            let resp = {
              status: 200,
              message: 'User details updated successfully',
              armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
            }
            res.status(200).json({
              resp: encrypt(JSON.stringify(resp))
            })
          }
        }
      } else {
        if (user.firstname !== firstname) {
          const updateUser = await User.findByIdAndUpdate(
            { _id: user_id },
            { firstname: firstname },
            { new: true, useFindAndModify: false }
          );
        }
        if (user.lastname !== lastname) {
          const updateUser = await User.findByIdAndUpdate(
            { _id: user_id },
            { lastname: lastname },
            { new: true, useFindAndModify: false }
          );
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const updateUser = await User.findByIdAndUpdate(
            { _id: user_id },
            { password: password },
            { new: true, useFindAndModify: false }
          );
          let resp = {
            status: 200,
            message: 'User details updated successfully',
            armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
          }
          res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
          })
        } else {
          let resp = {
            status: 200,
            message: 'User details updated successfully',
            armessage: 'تم تحديث تفاصيل المستخدم بنجاح'
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
      message: 'Error while updating user details',
      armessage: 'خطأ أثناء تحديث تفاصيل المستخدم'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.deleteUserCredentialByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const deleteUser = await User.findByIdAndDelete({ _id: user_id });
    res.status(200).json({
      status: 200,
      message: 'User details deleted successfully',
      armessage: 'تم حذف تفاصيل المستخدم بنجاح'
    });
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: 'Error while deleting user',
      armessage: 'خطأ أثناء حذف المستخدم'
    })
  }
});
exports.editprofileByAdmin = asyncHandler(async (req, res, next) => {
  try {
    // const profile = await User.findOne({ _id: req.params.id });
    const update_profile = await User.findByIdAndUpdate({ _id: req.params.id }, req.body, { new: true, useFindAndModify: false });

    res.status(200).json({
      status: 200,
      message: "Profile updated successfully",
      armessage: 'تم تحديث الملف الشخصي بنجاح'
    })

  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while updating profile",
      armessage: 'خطأ أثناء تحديث الملف الشخصي'
    })
  }
});
exports.updateEmailByAdmin = asyncHandler(async (req, res, next) => {
  try {
    let { email } = req.body
    const profile = await User.find({ email: email });
    if (profile.length > 0) {
      res.status(200).json({
        status: 400,
        message: "Email already taken, please select another different email",
        armessage: 'البريد الالكتروني اخذ من قبل. الرجاء تحديد بريد إلكتروني آخر'

      })
    } else {
      const update_profile = await User.findByIdAndUpdate({ _id: req.params.id }, { email: email }, { new: true, useFindAndModify: false });
      res.status(200).json({
        status: 200,
        message: "Email updated successfully",
        armessage: 'تم تحديث البريد الإلكتروني بنجاح'
      })
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while updating email",
      armessage: 'خطأ أثناء تحديث البريد الإلكتروني'
    })
  }
});
exports.updatePhoneNumberAdmin = asyncHandler(async (req, res, next) => {
  try {
    let { phone_number } = req.body
    const profile = await User.find({ phone_number: phone_number });
    if (profile.length > 0) {
      res.status(200).json({
        status: 400,
        message: "Phone number already exists, please select another different Phone number",
        armessage: `تم استخدام رقم الهاتف مُسبقاً، يرجى ادخال رقم هاتف آخر`
      })
    } else {
      const update_profile = await User.findByIdAndUpdate({ _id: req.params.id }, { phone_number: phone_number }, { new: true, useFindAndModify: false });
      res.status(200).json({
        status: 200,
        message: "Phone Number updated successfully",
        armessage: 'تم تحديث رقم الهاتف بنجاح'
      })
    }

  } catch (err) {
    next(err);
    res.status(200).json({
      status: 200,
      message: "Error while updating phone number",
      armessage: 'خطأ أثناء تحديث رقم الهاتف'
    })
  }
});
exports.viewUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find({ blocked: "false" });
    let users_list = [];
    let users_approved = [];
    let users_pending = [];
    let publishers_pending = [];
    let publishers_approved = [];
    if (users.length > 0) {
      for (let user of users) {
        if (user.roll == "Publisher" && user.status == 'Approved') {
          publishers_approved.push({
            name: user.firstname + ' ' + user.lastname,
            roll: user.roll,
            language: user.language,
            status: user.status,
            _id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            createdAt: user.createdAt,
          });
        } else if (user.roll == "Publisher" && user.status == 'Pending') {
          publishers_pending.push({
            name: user.firstname + ' ' + user.lastname,
            roll: user.roll,
            language: user.language,
            status: user.status,
            _id: user.id,
            email: user.email,
            phone_number: user.phone_number,
            createdAt: user.createdAt
          });
        } else if (user.roll == "User" && user.status == 'Approved') {
          users_approved.push(user);
          users_list.push(user);
        } else if (user.roll == "User" && user.status == 'Pending') {
          users_pending.push(user);
          users_list.push(user);
        }
      }
      let resp = {
        status: 200,
        active: users_approved,
        pending: users_pending,
        publishers_approved,
        publishers_pending,
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    } else {
      let resp = {
        status: 200,
        active: [],
        pending: [],
        publishers_approved: [],
        publishers_pending: [],
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
    });
  }
});
exports.viewUsersById = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let month_names = ['january', 'february', 'march', 'april', 'may', 'june'
      , 'july', 'august', 'september', 'october', 'november', 'december'];
    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    const users = await User.findById({ _id: cred.user_id });
    if (users.roll == 'User') {
      const budget = await Budget.find({ user_id: cred.user_id, month: month_names[currentMonth], year: currentYear });
      const income = await Income.findOne({ user_id: cred.user_id, month: month_names[currentMonth] })
      // console.log(income)

      let budget_with_savings = [];
      let total_utilized = 0
      let total_savings_percentage = 0;
      let total_spendings_percentage = 0;
      let total_budget = 0;
      for (let i = 0; i < budget.length; i++) {
        total_utilized = budget[i].amount - budget[i].remaining_amount
        budget_with_savings.push({ budget: budget[i].category_id, saving: total_utilized })
        total_savings_percentage += budget[i].remaining_amount
        total_spendings_percentage += total_utilized
        total_budget += budget[i].amount
      }

      let percentage = 0;
      if (income) {
        percentage = (total_savings_percentage / income.amount) * 100;
      }
      let percentage_ = (total_spendings_percentage / total_budget) * 100;

      let resp = {
        status: 200,
        users: users,
        savings: percentage,
        spendings: percentage_
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      });
    }
    else {
      let resp = {
        status: 200,
        users: users
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
    });
  }
});
exports.suspendUser = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const users = await User.findByIdAndUpdate(
      { _id: cred.user_id },
      { status: "Pending" },
      { new: true, useFindAndModify: false }
    );

    let resp = {
      status: 200,
      message: "User Suspended",
      armessage: 'تم تعليق المستخدم'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 200,
      message: "Error while processing",
      armessage: 'خطأ أثناء المعالجة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.approveUser = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const users = await User.findByIdAndUpdate(
      { _id: cred.user_id },
      { status: "Approved" },
      { new: true, useFindAndModify: false }
    );

    let resp = {
      status: 200,
      message: "User Approved",
      armessage: `تم اعتماد المستخدم`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  } catch (err) {
    next(err);
    let resp = {
      status: 200,
      message: "Error while processing",
      armessage: 'خطأ أثناء المعالجة'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.getAds = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let { user_id } = cred
    // const get_ads = await Ads.find({ user_id: cred.user_id });

    // if (get_ads.length == 0) {
    //   let resp = {
    //     status: 200,
    //     pending_ads_with_count: 0,
    //     expired_ads_with_count: 0,
    //     blocked_ads_with_count: 0,
    //     approved_ads_with_count: 0,
    //     package_status: null
    //   }
    //   res.status(200).json({
    //     resp: encrypt(JSON.stringify(resp))
    //   });
    // } else {
    //   const clicks = await Clicks.find();
    //   const views = await Views.find();
    //   const pending_ads = get_ads.filter(ad => ad.status === 'Pending');
    //   const blocked_ads = get_ads.filter(ad => ad.status === 'Blocked');
    //   const expired_ads = get_ads.filter(ad => ad.status === 'Expired');
    //   const approved_ads = get_ads.filter(ad => ad.status === 'Approved');

    //   const pending_ads_with_count = [];
    //   const blocked_ads_with_count = [];
    //   const expired_ads_with_count = [];
    //   const approved_ads_with_count = [];

    //   for (let i = 0; i < blocked_ads.length; i++) {
    //     let total_views = 0;
    //     let total_clicks = 0;
    //     for (let j = 0; j < views.length; j++) {
    //       if (views[j].ad_id == blocked_ads[i].id) {
    //         total_views++
    //       }
    //     }

    //     for (let j = 0; j < clicks.length; j++) {
    //       if (clicks[j].ad_id == blocked_ads[i].id) {
    //         total_clicks++
    //       }
    //     }
    //     blocked_ads_with_count.push({ ad: blocked_ads[i], views: total_views, clicks: total_clicks })
    //   }

    //   for (let i = 0; i < pending_ads.length; i++) {
    //     let total_views = 0;
    //     let total_clicks = 0
    //     for (let j = 0; j < views.length; j++) {
    //       if (views[j].ad_id == pending_ads[i].id) {
    //         total_views++
    //       }
    //     }

    //     for (let j = 0; j < clicks.length; j++) {
    //       if (clicks[j].ad_id == pending_ads[i].id) {
    //         total_clicks++
    //       }
    //     }
    //     pending_ads_with_count.push({ ad: pending_ads[i], views: total_views, clicks: total_clicks })
    //   }

    //   for (let i = 0; i < expired_ads.length; i++) {
    //     let total_views = 0;
    //     let total_clicks = 0
    //     for (let j = 0; j < views.length; j++) {
    //       if (views[j].ad_id == expired_ads[i].id) {
    //         total_views++
    //       }
    //     }

    //     for (let j = 0; j < clicks.length; j++) {
    //       if (clicks[j].ad_id == expired_ads[i].id) {
    //         total_clicks++
    //       }
    //     }
    //     expired_ads_with_count.push({ ad: expired_ads[i], views: total_views, clicks: total_clicks })
    //   }

    //   for (let i = 0; i < approved_ads.length; i++) {
    //     let total_views = 0;
    //     let total_clicks = 0
    //     // console.log(blocked_ads.id)
    //     for (let j = 0; j < views.length; j++) {
    //       if (views[j].ad_id == approved_ads[i].id) {
    //         total_views++
    //       }
    //     }

    //     for (let j = 0; j < clicks.length; j++) {
    //       if (clicks[j].ad_id == approved_ads[i].id) {
    //         total_clicks++
    //       }
    //     }
    //     approved_ads_with_count.push({ ad: approved_ads[i], views: total_views, clicks: total_clicks })
    //   }
    //   const user_status = await UserPackage.findOne({ user_id: user_id });

    //   let resp = {
    //     status: 200,
    //     pending_ads_with_count,
    //     expired_ads_with_count,
    //     blocked_ads_with_count,
    //     approved_ads_with_count,
    //     package_status: user_status.status,
    //     ads__
    //   }
    //   res.status(200).json({
    //     resp: encrypt(JSON.stringify(resp))
    //   });
    // }

    let ads__ = await Ads.aggregate([
      { "$match": { "user_id": mongoose.Types.ObjectId(user_id) } },
      {
        $lookup: {
          from: "clicks",
          localField: "_id",
          foreignField: "ad_id",
          as: "clicks"
        }
      },
      {
        $lookup: {
          from: "views",
          localField: "_id",
          foreignField: "ad_id",
          as: "views"
        }
      },
      {
        $lookup: {
          from: "impressions",
          localField: "_id",
          foreignField: "ad_id",
          as: "impressions"
        }
      },
    ]);
    resp = {
      status: 200,
      ads: ads__
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });

  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: "Error while fetching data",
      armessage: 'خطأ أثناء جلب البيانات'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    });
  }
});
exports.usersByActivityStatus = asyncHandler(async (req, res, next) => {
  try {
    let newDate = new Date();
    let month = newDate.getMonth();
    let year = newDate.getFullYear();
    let currentDate = newDate.getDate();
    let hours = newDate.getHours();
    let minutes = newDate.getMinutes();
    let recent_logger_array = await Logger.aggregate([
      {
        $match: {
          time: {
            $gte: new Date(year, month, currentDate - 2, hours, minutes)
          }
        }
      },
      { $group: { _id: { user_id: "$user_id", user_email: "$user_email", username: "$username", roll: "$roll" }, total: { $sum: 1 } } }
    ])
    const users_active = await User.find({ active: true });
    const users_not_active = await User.find({ active: false });
    let resp = {
      status: 200,
      total_online: users_active.length,
      total_offline: users_not_active.length,
      total_active: recent_logger_array.length,
      online_Users: users_active,
      offine_Users: users_not_active,
      active_Users: recent_logger_array
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
    res.status(500).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.getRevenueByUser = asyncHandler(async (req, res, next) => {
  try {
    let getRevenueByUser_ = await User.aggregate([{
      $match: {},
      $lookup: {
        from: 'revenues',
        localField: "_id",
        foreignField: "user_id",
        as: 'revenue'
      }
    }]);

    let budgets_with_categories = await User.aggregate([
      { $match: { roll: { $eq: 'Publisher' } } },
      {
        $lookup: {
          from: 'revenues',
          as: 'revenue',
          let: { _id: '$user_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user_id', '$$_id'] },
                  ]
                }
              }
            }
          ]
        }
      },
    ]);
    console.log(budgets_with_categories)

    // console.log(getRevenueByUser_)


    // const publishers = await User.find({ roll: 'Publisher' });
    // const revenue = await Revenue.find();
    // let publisher_with_revenue = [];

    // for (let i = 0; i < publishers.length; i++) {
    //   var total = 0;
    //   for (let j = 0; j < revenue.length; j++) {
    //     if (revenue[j].user_id == publishers[i].id) {
    //       total += revenue[j].amount
    //     }
    //   }
    //   publisher_with_revenue.push({
    //     publisher_id: publishers[i].id,
    //     publisher_name: publishers[i].firstname + " " + publishers[i].lastname,
    //     publisher_email: publishers[i].email,
    //     publisher_phone: publishers[i].phone_number,
    //     total: total
    //   })
    // }

    let resp = {
      status: 200,
      getRevenueByUser_
    };
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
    res.status(500).json({
      resp: encrypt(JSON.stringify(resp))
    })

  }

});
exports.getRevenueByDate = asyncHandler(async (req, res, next) => {
  try {
    const revenue = await Revenue.find();
    let revenue_by_date = [];

    const month = req.params.month
    const year = req.params.year
    var lastDay = new Date(year, month, 0);

    let date = new Date();
    let revenue_found = await Revenue.find({
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });
    if (month == date.getMonth() + 1) {
      for (let i = 1; i <= date.getDate(); i++) {
        var total_revenue = await revenue.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        var total_by_each_month = 0;
        for (let j = 0; j < total_revenue.length; j++) {
          total_by_each_month += total_revenue[j].amount
        }
        revenue_by_date.push({ date: i, counts: total_by_each_month })
      }
    }
    else {
      for (let i = 1; i <= lastDay.getDate(); i++) {
        var total_revenue = await revenue.filter(m => m.createdAt.getDate() == i && m.createdAt.getMonth() + 1 == month && m.createdAt.getFullYear() == year)
        var total_by_each_month = 0;
        for (let j = 0; j < total_revenue.length; j++) {
          total_by_each_month += total_revenue[j].amount
        }
        revenue_by_date.push({ date: i, counts: total_by_each_month })
      }
    }

    let resp = {
      status: 200,
      revenue_by_date,
      revenue_found
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
exports.appInstalled = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    let { device_id } = cred.device_id;
    const app_installed = await AppInstalled.create({
      device_id
    })

    let resp = {
      status: 200,
      message: 'App installation record saved'
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  } catch (err) {
    next(err);

    let resp = {
      status: 400,
      message: err.message
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.showUserBanks = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name));
    const banks = await Bank.find({ user_id: cred.user_id });

    if (banks.length > 0) {
      let resp = {
        status: 200,
        total_banks: banks.length,
        banks
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        status: 200,
        total_banks: 0,
        banks: []
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
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
    })
  }
});
exports.enableNotifications = asyncHandler(async (req, res, next) => {
  try {
    let { name } = req.body;
    let cred = JSON.parse(decrypt(name))
    let { playerId } = cred;
    if (playerId == undefined || playerId == null || playerId == '') {
      let resp = {
        status: 401,
        message: 'Played ID required to enable Notifications',
        armessage: `مطلوب معرف اللعب لتمكين الإشعارات`
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      if (!(req.user == undefined)) {
        const users = await User.findByIdAndUpdate({ _id: req.user.id }, { playerId: playerId }, { new: true, useFindAndModify: false })
        if (req.user.language == 'en') {
          if (playerId) {
            var mes = {
              app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
              contents: { en: `You have enabled notifications from Masoon` },
              include_player_ids: [playerId]
            };
            pushNot.sendNotification(mes);
          }
        } else {
          if (playerId) {
            var mes = {
              app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
              contents: { en: `لقد قمت بتمكين الإشعارات من تطبيق مصون` },
              include_player_ids: [playerId]
            };
            pushNot.sendNotification(mes);
          }
        }
        let resp = {
          status: 200,
          message: 'Notifications enabled',
          armessage: `تم تفعيل الإشعارات`
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      }
      else {
        let resp = {
          status: 401,
          message: 'Not authorized to access this route',
          armessage: 'غير مخول للوصول إلى هذا الطريق'
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      }
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 200,
      message: 'Error while enabling notifications',
      armessage: `خطأ أثناء تمكين الاشعارات`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});
exports.notificationCheck = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.playerId == 'disabled') {
      let resp = {
        status: 200,
        message: false
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else if (req.user.playerId == null) {
      let resp = {
        status: 200,
        message: false
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
    } else {
      let resp = {
        status: 200,
        message: true
      }
      res.status(200).json({
        resp: encrypt(JSON.stringify(resp))
      })
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
    })
  }
});
exports.disableNotifications = asyncHandler(async (req, res, next) => {
  try {
    if (!(req.user == undefined)) {
      const users = await User.findByIdAndUpdate({ _id: req.user.id }, { playerId: 'disabled' }, { new: true, useFindAndModify: false })
      if (users) {
        let resp = {
          status: 200,
          message: 'Notifications disabled',
          armessage: `الاشعارات غير مفعلة`
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      } else {
        let resp = {
          status: 400,
          message: 'Error while disabling notifications',
          armessage: 'خطأ أثناء تعطيل الإخطارات'
        }
        res.status(200).json({
          resp: encrypt(JSON.stringify(resp))
        })
      }
    }
    else {
      let resp = {
        status: 401,
        message: 'Not authorized to access this route',
        armessage: 'غير مخول للوصول إلى هذا الطريق'
      }
      res.status(401).json({
        resp: encrypt(JSON.stringify(resp))
      })
    }
  } catch (err) {
    next(err);
    let resp = {
      status: 400,
      message: 'Error while disabling notifications',
      armessage: `خطأ أثناء إيقاف تفعيل الاشعارات`
    }
    res.status(200).json({
      resp: encrypt(JSON.stringify(resp))
    })
  }
});

