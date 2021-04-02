const express = require("express");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require('path');
const expbs = require('express-handlebars');
var https = require('https')
var fs = require('fs')
require('ssl-root-cas')
var cas;

cas = https.globalAgent.options.ca || [];
https.globalAgent.options.ca = cas;

// Route Imports
const auth_Router = require("./routes/auth");
const bills_Router = require("./routes/bills");
const subCategories_Router = require("./routes/sub_categories");
const categories_Router = require("./routes/categories");
const budget_Router = require('./routes/budget');
const otp_Router = require('./routes/otp');
const email_Router = require('./routes/email');
const merchant_Router = require('./routes/merchant')
const paymentType_Router = require('./routes/payment_type');
const Tags_Router = require('./routes/tags');
const transaction_Router = require('./routes/transaction');
const tagTransaction_Router = require('./routes/tag_transactions');
const payments_Router = require('./routes/payments');
const cashFlow_Router = require('./routes/cashflow');
const dashboard_Router = require('./routes/dashboard');
const admin_Router = require('./routes/admin/adminRoutes');
const admin_Router_Package = require('./routes/admin/packages');
const userMessages_Router = require('./routes/user_messages');
const trends_Router = require('./routes/trends/trends');
const Ads_Router = require('./routes/ads/ads');
const Publisher_Dashboard_Router = require('./routes/ads/advDashBoard');
const Bank_Account_Router = require('./routes/admin/accounts');
const allAds_Router = require('./routes/ads/allAds');
const logger_Router = require('./routes/logger');
const ratings_Router = require('./routes/ratings');
const conversations_Router = require('./routes/conversations');
const phoneSms_Router = require('./routes/phoneSms');
const admin_categories_Router = require('./routes/admin/categories');
const bank_Router = require('./routes/bankLinking');
const income_Router = require('./routes/income');
const language_Router = require('./routes/language');
const truncateDB_Router = require('./routes/trucncateDB/truncateUserData');
const dataEntry_Router = require('./routes/dataEntry');
const factory_Router = require('./routes/FactoryMedthods/factoryMethods');
const config = require('./config/config');


// Cron jobs
const otpExpired = require('./crons/expirationCron');
const billsDue = require('./crons/billsCron');
const packageExpired = require('./crons/packagesCrons');


// middlewares
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const colors = require("colors");

// load ENV vars
dotenv.config({ path: "./config/config.env" });
const app = express();


// express handlebars
app.engine('handlebars', expbs({
  defaultLayout: false
}));
app.set('view engine', 'handlebars');



// cookie parser
app.use(cookieParser());
// Body Parser
app.use(express.json());
app.use("/logo", express.static("logo"));
app.use("/upload", express.static("upload"));
app.use("/category_store", express.static("category_store"));

app.use(express.static(path.join(__dirname, "client")))
// app.use("/logo", express.static("upload/bank_logos"));
// app.use("/public", express.static("public"));
app.use("/posts", express.static("posts"));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(bodyparser.urlencoded({ extended: false }));
// app.use(urlEncoded());

// Connect DB
connectDB();


// X-Frams-Options
var helmet = require('helmet')
app.use(helmet.frameguard({ action: "DENY" }));

// cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Route files
app.use("/api", auth_Router);
app.use("/api/bill", bills_Router);
app.use("/api/admin/subcategories", subCategories_Router);
app.use("/api/admin/categories", categories_Router);
app.use("/api/budget", budget_Router);
app.use("/api/", otp_Router);
app.use("/api/email", email_Router);
app.use("/api/merchant", merchant_Router);
app.use("/api/payment_type", paymentType_Router);
app.use("/api/tags", Tags_Router);
app.use("/api/transactions", transaction_Router);
app.use("/api/tagTransactions", tagTransaction_Router);
app.use("/api/payments", payments_Router);
app.use('/api/cashflow', cashFlow_Router);
app.use('/api/dashboard', dashboard_Router);
app.use('/api/admin', admin_Router);
app.use('/api/admin/package', admin_Router_Package);
app.use('/api/admin/account', Bank_Account_Router);
app.use('/api/user', userMessages_Router);
app.use('/api/trends', trends_Router);
app.use('/api/notice', Ads_Router);
app.use('/api/publisher', Publisher_Dashboard_Router);
app.use('/api/allads', allAds_Router);
app.use('/api/logger', logger_Router);
app.use('/api/ratings', ratings_Router);
app.use('/api/conversations', conversations_Router);
app.use('/api/sms', phoneSms_Router);
app.use('/api/category', admin_categories_Router);
app.use('/api/banks', bank_Router);
app.use('/api/income', income_Router);
app.use('/api/language', language_Router);
app.use('/api/entry', dataEntry_Router);
app.use('/api/factory', factory_Router);

// truncate data completely from db
app.use('/api/truncate', truncateDB_Router);
app.get("/handlebars", (req, res) => {
  res.render("otpCode");
});

app.use(errorHandler);

app.use(cookieParser());
process.env.TZ = 'Asia/Riyadh' // here is the magical line

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

let http = require("http");
const { CUSTOM_DATE } = require("./middleware/dateOffset");
const Income = require("./models/Income");
let server_2 = http.createServer(app)
  .listen(4000, function () {
    console.log('HTTP app listening on port 4000!')
  })

// let server_1 = https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app)
//   .listen(4000, function () {
//     console.log('HTTPS app listening on port 3000! Go to https://localhost:4000/')
//   })

// handle Unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
//   console.log(`Error: ${err.message}`.red);
//   server_2.close(() => process.exit(1));
// });

// process.on("unhandledRejection", (err, promise) => {
//   console.log(`Error: ${err.message}`.red);
//   server_1.close(() => process.exit(1));
// });
// console.log(new Date().getHours())
// // console.log(formatAMPM(new Date().getHours()));
// const mongoose = require('mongoose');
// const bills = require("./models/bills");
// let createFunc = async () => {

//   let incomes = await bills.find();
//   console.log(incomes[incomes.length - 1].due_date.getDate());

//   // const income = await Income.create({
//   //   user_id: mongoose.Types.ObjectId("6048cacc85376d2f5832e09f"),
//   //   title: 'awhdjawh',
//   //   amount: 542767,
//   //   month: 'March',
//   //   year: 2021,
//   //   createdAt: new Date(),
//   // });
// }
// createFunc()