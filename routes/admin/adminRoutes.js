const express = require("express");
const { protect } = require("../../middleware/auth");
const {
    viewUsers,
    suspendUser,
    approveUser,
    dashBoard,
    transactions,
    bills,
    allBills,
    alltransactions,
    sendMessage,
    getMessage,
    sendNotification,
    viewUsersById,
    getAds,
    sendAlertForBills,
    sendBudgetAlert,
    activeStatus,
    offlineStatus,
    usersByActivityStatus,
    getPublisherPackage,
    getPublisherAdInsights,
    getRevenueByUser,
    getRevenueByDate,
    appInstalled,
    showUserBanks,
    disableNotifications,
    notificationCheck,
    enableNotifications,
    createUserByAdmin,
    editUserCredentialByAdmin
} = require("../../controllers/admin/users");
const multer = require("multer");
const { checkCashFlow, toggleCashFlow } = require("../../controllers/admin/cashflow");
const parse = multer();

const router = express.Router();
router.route('/users').get(protect, viewUsers);
router.route('/disable/notifications').put(protect, disableNotifications);
router.route('/check/notifications').get(protect, parse.any(), notificationCheck);
router.route('/enable/notifications').put(protect, parse.any(), enableNotifications);
router.route('/users/publisher-id').put(protect, getPublisherPackage);
router.route('/users/publisher/revenue/all').get(protect, getRevenueByUser);
router.route('/users/banks-id').put(protect, showUserBanks);
router.route('/app-installed').post(appInstalled);
router.route('/users/publisher/revenue/:month/:year').get(protect, getRevenueByDate);
router.route('/users/publisher/ad-insights/all/:month/:year').get(protect, getPublisherAdInsights);
router.route('/users/ads-id').put(protect, getAds);
router.route('/budget/alert').post(protect, parse.any(), sendBudgetAlert);
router.route('/users-id').put(protect, viewUsersById);
router.route('/users/suspend-id').put(protect, suspendUser);
router.route('/users/approve-id').put(protect, approveUser);
router.route('/users/online-id').put(protect, activeStatus);
router.route('/users/offline-id').put(protect, offlineStatus);
router.route('/users/active/all/:status/:date').get(protect, usersByActivityStatus)
router.route('/dashboard').get(protect, dashBoard);
router.route('/transactions').get(protect, transactions);
router.route('/bills').get(protect, bills);
router.route('/bills/:id').get(protect, allBills);
router.route('/public-messages').get(protect, getMessage);
router.route('/transactions/:id').get(protect, alltransactions);
router.route('/message').post(protect, parse.any(), sendMessage);
router.route('/notification/bill').post(protect, parse.any(), sendAlertForBills);
router.route('/notification-id').post(protect, parse.any(), sendNotification);
router.route('/create-user').post(protect, parse.any(), createUserByAdmin);
router.route('/edit-user').put(protect, parse.any(), editUserCredentialByAdmin);
router.route('/cashflow').get(protect, parse.any(), checkCashFlow);
router.route('/cashflow').put(protect, parse.any(), toggleCashFlow);
module.exports = router;

