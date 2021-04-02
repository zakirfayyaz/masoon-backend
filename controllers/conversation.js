const express = require("express");
const app = express();
const asyncHandler = require("../middleware/async");
const encrypt = require("../middleware/GenerateAESKeys");
const decrypt = require("../middleware/GenerateRSAKeys");
const Conversation = require('../models/Conversations');
const User = require('../models/users_model');
const sendEmailByAdmin = require("../middleware/mails");
const users_model = require("../models/users_model");
const Notification = require("../models/Notifications");
const { emailAlert } = require("./templates/enMail");
const fs = require("fs");
const pushNot = require("../middleware/pushNotification");

exports.sentByUser = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const { message, subject } = cred
        const newConversation = await Conversation.create({
            sender_id: req.user.id,
            subject: subject,
            message: message,
            conversation_id: req.user.id,
            name: req.user.firstname + ' ' + req.user.lastname,
            email: req.user.email,
            createdAt: new Date(),
            roll: req.user.roll
        });
        let enMEssage = `You have a new enquiry email from ${req.user.firstname + ' ' + req.user.lastname} \n\n ${message}`;
        let enSubject = 'Masoon Enquiry Email'
        let mailOptions = {
            from: req.user.email,
            to: process.env.EMAIL,
            subject: enSubject,
            html: emailAlert(req.user.firstname + ' ' + req.user.lastname, enMEssage, enSubject),
        };
        sendEmailByAdmin(mailOptions)
        let admin = await users_model.findOne({ roll: 'Admin' });
        if (admin) {
            const notification = await Notification.create({
                user_id: admin.id,
                body: message,
                subject: "Masoon Enquiry Email",
                email: req.user.email
            });
            if (admin.playerId !== null && admin.playerId !== "disabled") {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: `Masoon Enquiry Email}` },
                    include_player_ids: [admin.playerId]
                };
                pushNot.sendNotification(mes);
            }
        }

        let resp = {
            status: 200,
            message: "Message sent successfully",
            armessage: 'تم ارسال الرسالة بنجاح'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
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
exports.sentByAdmin = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const { message, subject, id } = cred
        const newConversation = await Conversation.create({
            sender_id: req.user.id,
            subject: subject,
            message: message,
            conversation_id: id,
            name: 'Masoon Admin',
            email: "",
            createdAt: new Date(),
            roll: req.user.roll
        });

        let enMEssage = `You have a new Email from Masoon \n\n ${message}`;
        // let enSubject = ''
        let user_ = await users_model.findById({ _id: id });
        let mailOptions = {
            from: req.user.email,
            to: process.env.EMAIL,
            subject: subject,
            html: emailAlert(user_.firstname + ' ' + user_.lastname, enMEssage, subject),
        };
        sendEmailByAdmin(mailOptions)

        if (user_) {
            const notification = await Notification.create({
                user_id: user_.id,
                body: message,
                subject: subject,
                email: req.user.email
            });
            if (user_.playerId !== null && user_.playerId !== "disabled") {
                var mes = {
                    app_id: "3e4aeb4a-eb53-479c-bb47-187580c1b126",
                    contents: { en: subject },
                    include_player_ids: [user_.playerId]
                };
                pushNot.sendNotification(mes);
            }
        }

        let resp = {
            status: 200,
            message: "Message sent successfully",
            armessage: 'تم ارسال الرسالة بنجاح'
        }
        res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
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
exports.getConversation = asyncHandler(async (req, res, next) => {
    try {
        const conversations = await (await Conversation.find().sort({ createdAt: -1 }));
        let conversation_ids = [];
        for (let i = 0; i < conversations.length; i++) {
            conversation_ids.push(conversations[i].conversation_id.toString());
        }
        let unique_conversations = [...new Set(conversation_ids)];
        let rooms = [];
        if (unique_conversations.length > 0) {
            for (let i = 0; i < unique_conversations.length; i++) {
                const user = await User.findOne({ _id: unique_conversations[i] })
                const messages_unread = await conversations.filter(m => m.conversation_id == user.id && m.status == 'Unread');
                if (user.profile_image == null || user.profile_image == undefined || user.profile_image == '') {
                    if (messages_unread.length > 0) {
                        rooms.push({
                            user_name: user.firstname + ' ' + user.lastname,
                            conversation_id: user.id,
                            profile_image: null,
                            user_email: user.email,
                            unread_messages_count: messages_unread.length,
                            time: messages_unread[messages_unread.length - 1].createdAt
                        });
                    } else {
                        const messages_read = await conversations.filter(m => m.conversation_id == user.id);
                        rooms.push({
                            user_name: user.firstname + ' ' + user.lastname,
                            conversation_id: user.id,
                            profile_image: null,
                            user_email: user.email,
                            unread_messages_count: 0,
                            time: messages_read[messages_read.length - 1].createdAt
                        });
                    }
                } else {
                    if (messages_unread.length > 0) {
                        rooms.push({
                            user_name: user.firstname + ' ' + user.lastname,
                            conversation_id: user.id,
                            user_email: user.email,
                            profile_image: user.profile_image,
                            unread_messages_count: messages_unread.length,
                            time: messages_unread[messages_unread.length - 1].createdAt
                        });
                    } else {
                        const messages_read = await conversations.filter(m => m.conversation_id == user.id);
                        rooms.push({
                            user_name: user.firstname + ' ' + user.lastname,
                            conversation_id: user.id,
                            user_email: user.email,
                            profile_image: user.profile_image,
                            unread_messages_count: 0,
                            time: messages_read[messages_read.length - 1].createdAt
                        });
                    }
                }
            }
        }
        let resp = {
            status: 200,
            rooms
        }
        console.log(resp);
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
exports.getChatsFromRoomId = asyncHandler(async (req, res, next) => {
    try {
        let { name } = req.body;
        let cred = JSON.parse(decrypt(name));
        const chats = await Conversation.find({ conversation_id: cred.id });
        // console.log(chats);
        if (chats.length >= 0) {
            if (req.user.roll == 'Admin') {
                for (let i = 0; i < chats.length; i++) {
                    const mark_read = await Conversation.findByIdAndUpdate({ _id: chats[i].id },
                        { status: 'Read' },
                        { new: true, useFindAndModify: false });
                }
            }
            let resp = {
                status: 200,
                chats
            }
            return res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        } else {
            let resp = {
                status: 200,
                chats
            }
            return res.status(200).json({
                resp: encrypt(JSON.stringify(resp))
            });
        }
    } catch (err) {
        next(err);
        let resp = {
            status: 400,
            message: "Error while fetching data",
            armessage: `خطأ أثناء جلب البيانات`
        }
        return res.status(200).json({
            resp: encrypt(JSON.stringify(resp))
        });
    }
});


