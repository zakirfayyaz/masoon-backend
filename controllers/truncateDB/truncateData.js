const User = require('../../models/users_model');
const Transaction = require('../../models/transactions');
const TagTransaction = require('../../models/tag_transaction');
const Tags = require('../../models/tags');
const Merchants = require('../../models/merchant');
const Bills = require('../../models/bills');
const Payment = require('../../models/payment');
const Budget = require('../../models/budgets');
const Income = require('../../models/Income');
const Logger = require('../../models/Logger');
const Banks = require('../../models/Banks');
const BankTransaction = require('../../models/BankTransactions');
const Message = require('../../models/message');
const Notification = require('../../models/Notifications');
const Rating = require('../../models/Ratings');
const UserEmails = require('../../models/User_email');
const Clicks = require('../../models/ads/Clicks');
const Views = require('../../models/ads/Views');
const Impressions = require('../../models/ads/Impressions');
const Ads = require('../../models/ads/ads'); // for publisher only
const Revenue = require('../../models/ads/Revenue'); // for publisher only
const UserPackage = require('../../models/UserPackage'); // for publisher only

const asyncHandler = require('../../middleware/async');
const mongoose = require('mongoose');
const decrypt = require('../../middleware/GenerateRSAKeys');
const encrypt = require('../../middleware/GenerateAESKeys');
exports.truncateUser = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        let user_id = cred.user_id;
        const user = await User.findById({ _id: user_id });
        if (user.roll == 'User') {
            // 1. delete all transactions of given user
            const transactions = await Transaction.deleteMany({ user_id: user_id });
            // 2. delete transaction tags of the user
            const tag_transactions = await TagTransaction.deleteMany({ user_id: user_id });
            // 3. delete all tags of the user
            const tags = await Tags.deleteMany({ user_id: user_id });
            // 4. delete merchants of given user
            const merchants = await Merchants.deleteMany({ user_id: user_id })
            // 5. delete all bills of given user
            const bills = await Bills.deleteMany({ user_id: user_id });
            // 6. delete all the payments record of given user
            const payments = await Payment.deleteMany({ user_id: user_id });
            // 7. delete all the budgets of the given user
            const budgets = await Budget.deleteMany({ user_id: user_id });
            // 8. delete all the incomes of the given user
            const incomes = await Income.deleteMany({ user_id: user_id });
            // 9. delete all the logging records of the given user
            const loggers = await Logger.deleteMany({ user_id: user_id });
            // 10. delete all the linked bansk of the given user
            const banks = await Banks.deleteMany({ user_id: user_id });
            // 11. delet all the Bank Transaction of the given user
            const bankTransactions = await BankTransaction.deleteMany({ user_id: user_id });
            // 12. delete all the messages of given user 
            const messages = await Message.deleteMany({ user_id: user_id });
            // 13. delete all the notifications of given user
            const notifications = await Notification.deleteMany({ user_id: user_id });
            // 14. delete all the ratings of given user
            const ratings = await Rating.deleteMany({ user_id: user_id })
            // 15. delete all the contact emails of given user
            const delete_user_emails = await UserEmails.deleteMany({ user_id: user_id });
            // 16. delete all the clicks of given user
            const clicks = await Clicks.deleteMany({ user_id: user_id });
            // 17. delete all the views of given user
            const views = await Views.deleteMany({ user_id: user_id });
            // 18. delete all the impressions of the given user
            const impressions = await Impressions.deleteMany({ user_id: user_id });

            let resp = {
                status: 200,
                message: `${user.roll} named ${user.firstname + ' ' + user.lastname} is deleted`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
            // const user__ = await User.findByIdAndDelete({ _id: user_id })
        } else if (user.roll == 'Publisher') {
            // 19. delete all the ads of the given user
            const ads = await Ads.find({ user_id: user_id });
            if (ads.length > 0) {
                for (let i = 0; i < ads.length; i++) {
                    const clicks = await Clicks.deleteMany({ ad_id: ads[i].id });
                    // 17. delete all the views of given user
                    const views = await Views.deleteMany({ ad_id: ads[i].id });
                    // 18. delete all the impressions of the given user
                    const impressions = await Impressions.deleteMany({ ad_id: ads[i].id });
                    // delete that particular ad as well
                    let deleteAd = await Ads.findByIdAndDelete({ _id: ads[i].id })
                }
            }
            const user_packages = await UserPackage.deleteMany({ user_id: user_id });
            const revenues = await Revenue.deleteMany({ user_id: user_id });
            let resp = {
                status: 200,
                message: `${user.roll} named ${user.firstname + ' ' + user.lastname} is deleted`
            }
            res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            })
            const user__ = await User.findByIdAndDelete({ _id: user_id })
        }
    } catch (err) {
        next(err);
    }
});