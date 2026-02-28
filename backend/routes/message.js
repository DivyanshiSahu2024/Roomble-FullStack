const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const Landlord = require('../models/Landlord');
const Conversation = require('../models/Conversation');
const checkuser = require('../middlewares/checkuser');
const mongoose = require('mongoose');
const checkUser = require('../middlewares/checkuser');

// Export a function that initializes routes with socket.io and online users
module.exports = (io, onlineUsers) => {
    // Route to get the name and online status of a user
    router.post('/getUserNameStatus', async (req, res) => {
        try {
            const { userID } = req.body;

            // Check if the user is online
            var status = "offline";
            if (onlineUsers.has(userID)) {
                status = "online";
            }

            // Fetch user details from Tenant or Landlord model
            var user = await Tenant.findById(userID);
            if (!user) {
                user = await Landlord.findById(userID);
            }
            if (!user) {
                return res.send({ success: false });
            }

            // Return user details and online status
            return res.send({ name: user.name, status: status, success: true, profilepic: user.Images });
        } catch (err) {
            res.send({ success: false });
        }
    });

    // Route to get all conversations of the authenticated user
    router.post('/getConversations', checkUser, async (req, res) => {
        try {
            const list = req.user.conversations; // List of conversation IDs for the user
            const conversations = [];

            for (let i = 0; i < list.length; i++) {
                const conversation = await Conversation.findById(list[i]);
                if (!conversation) {
                    continue;
                }

                // Identify the other user in the conversation
                const otherID = conversation.members[0].equals(req.user._id) ? conversation.members[1] : conversation.members[0];
                var otherUser = await Tenant.findById(otherID);
                if (!otherUser) {
                    otherUser = await Landlord.findById(otherID);
                }
                if (!otherUser) {
                    continue;
                }

                // Extract the last message and its timestamp
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                var lasttimestamp = null;
                if (lastMessage) {
                    lasttimestamp = lastMessage.timestamp;
                }

                // Add conversation details to the response
                conversations.push({
                    conversation_id: conversation._id,
                    lastMessage: lastMessage,
                    name: otherUser.name,
                    profilePic: otherUser.Images,
                    timestamp: lasttimestamp
                });
            }
            return res.send({ conversations, success: true });
        } catch (err) {
            console.log(err);
            res.send({ success: false });
        }
    });

    // Route to get a specific conversation by its ID
    router.post('/getConversation', checkUser, async (req, res) => {
        try {
            const conversation_id = req.body.conversation_id;
            const conversation = await Conversation.findById(conversation_id);

            
            if (!conversation) {
                res.send({ success: false });
                return;
            }
            // check if user is part of the conversation
            if (!conversation.members.includes(req.user._id)) {
                return res.send({ success: false });
            }
            res.send({ conversation, success: true });
        } catch (err) {
            console.log(err);
            res.send({ success: false });
        }
    });

    // Route to send a message in a conversation
    router.post('/sendMessage', checkuser, async (req, res) => {
        console.log("hello");
        const { conversation_id, message } = req.body;
        const senderID = req.user._id;

        // Find the conversation by ID
        const conversation = await Conversation.findById(conversation_id);
        if (!conversation) {
            res.send({ success: false });
            return;
        }

        // Construct the message object
        const newMessage = {
            senderID: senderID,
            message: message,
            timestamp: new Date()
        };

        // Update the conversation with the new message
        conversation.messages.push(newMessage);
        await conversation.save();

        res.send({ success: true, messages: conversation });

        // Notify the other user if they are online
        const receiverID = conversation.members[0].equals(senderID) ? conversation.members[1] : conversation.members[0];
        if (onlineUsers.has(receiverID.toString())) {
            io.to(onlineUsers.get(receiverID.toString())).emit('message', { conversation_id, messages: conversation });
        }
    });

    // Route to create a new conversation between two users
    router.post('/createConversation', checkuser, async (req, res) => {
        try {
            const { user2 } = req.body; // ID of the second user
            const user1 = req.user._id; // ID of the authenticated user
            const user2_id = new mongoose.Types.ObjectId(user2);

            // Prevent creating a conversation with oneself
            if (user1.equals(user2_id)) {
                return res.send({ success: false, message: "Something went wrong" });
            }

            // Check if a conversation already exists between the two users
            const conversation = await Conversation.findOne({ members: { $all: [user1, user2_id] } });
            if (conversation) {
                return res.send({ conversation_id: conversation._id, success: true });
            }

            // Create a new conversation
            const newConversation = new Conversation({
                members: [user1, user2_id],
                messages: []
            });
            await newConversation.save();

            // Add the conversation to both users' conversation lists
            var user1Doc = await Tenant.findById(user1);
            if (!user1Doc) {
                user1Doc = await Landlord.findById(user1);
            }
            user1Doc.conversations.push(newConversation._id);
            await user1Doc.save();

            var user2Doc = await Tenant.findById(user2_id);
            if (!user2Doc) {
                user2Doc = await Landlord.findById(user2_id);
            }
            user2Doc.conversations.push(newConversation._id);
            await user2Doc.save();

            return res.send({ conversation_id: newConversation._id, success: true });
        } catch (err) {
            res.send({ success: false });
        }
    });

    return router;
};