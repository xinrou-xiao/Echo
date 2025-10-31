const express = require('express');
const router = express.Router();
const Messasge = require('../models/Message');

router.get('/', async (req, res) => {
    try {
        const { user1, user2 } = req.body;

<<<<<<< Updated upstream
        const
=======
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

        if (!messages || messages.length == 0) {
            return res.status(404).json({
                success: false,
                message: "no messages found for given users."
            });
        }

        return res.json({
            success: true,
            data: messages
        });
>>>>>>> Stashed changes
    } catch (err) {
        console.error("get /message error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
<<<<<<< Updated upstream
});
=======
});

/**
 * @swagger
 * /api/message:
 *   post:
 *     summary: Send a new message
 *     description: Create and send a new message between two users
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageRequest'
 *           examples:
 *             example1:
 *               summary: Send a greeting message
 *               value:
 *                 senderId: "507f1f77bcf86cd799439011"
 *                 receiverId: "507f1f77bcf86cd799439012"
 *                 content: "Hello! How are you?"
 *     responses:
 *       200:
 *         description: Message successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid sender or receiver ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Receiver or sender does not exist.
 *       500:
 *         description: Server error
 */
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
        return res.json({
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
>>>>>>> Stashed changes
