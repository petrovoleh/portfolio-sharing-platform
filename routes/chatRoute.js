const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/user');
const Message = require('../models/message');
router.get('/chats', function (req, res) {
    if (req.session.isLoggedIn !== true) {
        return res.render('home', {
            session: req.session
        });
    }
    Chat.find({ $or: [{ user1_id: req.session.user._id }, { user2_id: req.session.user._id }] }, (err, chats) => {
        if (err) {
            console.error('Failed to fetch usernames and avatars:', err);
            return res.status(500).send('Failed to fetch usernames and avatars.');
        }
        User.find({}, '_id name avatar about', (err, users) => {
            if (err) {
                console.error('Failed to fetch usernames and avatars:', err);
                return res.status(500).send('Failed to fetch usernames and avatars.');
            }

            // Create an object to store user data
            const userData = {};
            users.forEach(user => {
                userData[user._id] = { name: user.name, avatar: user.avatar, about: user.about };
            });

            // Render the chats view and pass the necessary data
            res.render('chats', {
                session: req.session,
                chats: chats.map(chat => {
                    const user1 = userData[chat.user1_id];
                    const user2 = userData[chat.user2_id];

                    const name = chat.user2_id === req.session.user._id ? (user1 ? user1.name : "account deleted") : (user2 ? user2.name : "account deleted");
                    const avatar = chat.user2_id === req.session.user._id ? (user1 ? user1.avatar : "empty.jpg") : (user2 ? user2.avatar : "empty.jpg");

                    return {
                        ...chat.toObject(),
                        name,
                        avatar,
                    };
                }),
            });

        });
    });
});

router.post('/sendmessage', (req, res) => {
    if (req.session.isLoggedIn !== true) {
        return res.redirect('/');
    }
    const { chat_id, text } = req.body;
    const user_id = req.session.user._id;
    const time = new Date();

    // Create a new message
    const newMessage = new Message({
        chat_id: chat_id,
        user_id: user_id,
        text: text,
        time: time,
    });

    // Save the new message to the database
    newMessage.save((err, savedMessage) => {
        if (err) {
            console.error(err);
            return res.render('chat', { session: req.session, errorcode: "Internal Server Error" });
        }
        // Message saved successfully
        return res.redirect('back');
    });
});


router.get('/checkmessages', (req, res) => {
    const latestMessageId = req.query.latestMessageId; // Retrieve the latest message ID or timestamp from the request parameter

    // Query the database for new messages since the latest ID or timestamp
    Message.find({ _id: { $gt: latestMessageId } }, (err, newMessages) => {
        if (err) {
            console.error('Error querying for new messages:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Return the new messages as a JSON response
        return res.json({ newMessages });
    });
});

router.get('/chat/:id', (req, res) => {
    if (req.session.isLoggedIn !== true) {
        return res.redirect('/');
    }
    const { id } = req.params;
    // Find the user in the database based on the username
    User.findOne({ _id: id }, (err, user) => {
        if (err) {
            console.error(err);
            return res.render('errorpage', { session: req.session, errorcode: "Internal Server Error" });
        }

        if (!user) {
            // User not found in the database
            // Handle the situation appropriately (e.g., render a "User not found" page)
            return res.render('errorpage', { session: req.session, errorcode: "User " + id + " not found" });
        }
        Chat.findOne(
            {
                $or: [
                    { $and: [{ user1_id: id }, { user2_id: req.session.user._id }] },
                    { $and: [{ user2_id: id }, { user1_id: req.session.user._id }] }
                ]
            },
            (err, chat) => {
                if (err) {
                    console.error(err);
                    return res.render('errorpage', { session: req.session, errorcode: "Internal Server Error" });
                }

                if (!chat) {
                    // Chat does not exist, create a new chat and open it
                    const newChat = new Chat({
                        user1_id: req.session.user._id,
                        user2_id: id,
                    });

                    newChat.save((err, savedChat) => {
                        if (err) {
                            console.error(err);
                            return res.render('chat', { session: req.session, errorcode: "Internal Server Error" });
                        }

                        // Retrieve messages associated with the chat and sort by time in descending order
                        Message.find({ chat_id: savedChat._id })
                            .sort({ time: -1 })
                            .exec((err, messages) => {
                                if (err) {
                                    console.error(err);
                                    return res.render('errorpage', { session: req.session, errorcode: "Internal Server Error" });
                                }

                                res.render('chat', { session: req.session, chat: savedChat, user: user, messages: messages });
                            });
                    });
                } else {
                    // Chat already exists, open the existing chat
                    // Retrieve messages associated with the chat and sort by time in descending order
                    Message.find({ chat_id: chat._id })
                        .sort({ time: 1 })
                        .exec((err, messages) => {
                            if (err) {
                                console.error(err);
                                return res.render('errorpage', { session: req.session, errorcode: "Internal Server Error" });
                            }

                            res.render('chat', { session: req.session, chat: chat, user: user, messages: messages });
                        });
                }
            });
    });
});

module.exports = router;