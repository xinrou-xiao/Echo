const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { User } = require('../models/User');

router.get('/', async (req, res) => {
    try {
        const { user1Id, user2Id, page = 1, limit = 20 } = req.body;
        const skip = (page - 1) * limit;

        const [user1Exists, user2Exists] = await Promise.all([
            User.exists({ _id: user1Id }),
            User.exists({ _id: user2Id })
        ]);
        if (!user1Exists || !user2Exists) {
            return res.status(400).json({
                success: false,
                message: 'user1 or user2 does not exist.'
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        }).sort({ createAt: 1 }).skip(skip).limit(limit);

        if (!messages) {
            return res.status(404).json({
                success: false,
                message: "no messages found for given users."
            });
        }

        return res.json({
            success: true,
            data: messages
        });
    } catch (err) {
        console.error("get /message error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        const [receiverExists, senderExists] = await Promise.all([
            User.exists({ _id: receiverId }),
            User.exists({ _id: senderId })
        ]);

        if (!receiverExists || !senderExists) {
            return res.status(400).json({
                success: false,
                message: 'Receiver or sender does not exist.'
            });
        }
        const newMessage = new Message({
            receiverId,
            senderId,
            content
        });

        const savedMessage = await newMessage.save();
        return res.status(400).json({
            success: true,
            data: savedMessage
        });
    } catch (err) {
        console.error("post /message error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

module.exports = router;