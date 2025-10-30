const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { User } = require('../models/User');

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Message ID
 *         senderId:
 *           type: string
 *           description: ID of the message sender
 *         receiverId:
 *           type: string
 *           description: ID of the message receiver
 *         content:
 *           type: string
 *           description: Message content
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Message creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Message last update timestamp
 *     GetMessagesRequest:
 *       type: object
 *       required:
 *         - user1Id
 *         - user2Id
 *       properties:
 *         user1Id:
 *           type: string
 *           description: First user ID
 *         user2Id:
 *           type: string
 *           description: Second user ID
 *         page:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Page number for pagination
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *           description: Number of messages per page
 *     CreateMessageRequest:
 *       type: object
 *       required:
 *         - senderId
 *         - receiverId
 *         - content
 *       properties:
 *         senderId:
 *           type: string
 *           description: ID of the message sender
 *         receiverId:
 *           type: string
 *           description: ID of the message receiver
 *         content:
 *           type: string
 *           description: Message content
 *     MessagesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 */

/**
 * @swagger
 * /api/message:
 *   get:
 *     summary: Get messages between two users
 *     description: Retrieve paginated messages between two specified users, sorted by creation time
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetMessagesRequest'
 *           examples:
 *             example1:
 *               summary: Get first page of messages
 *               value:
 *                 user1Id: "507f1f77bcf86cd799439011"
 *                 user2Id: "507f1f77bcf86cd799439012"
 *                 page: 1
 *                 limit: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessagesResponse'
 *       400:
 *         description: Invalid user IDs provided
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
 *                   example: user1 or user2 does not exist.
 *       404:
 *         description: No messages found between the users
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
 *                   example: no messages found for given users.
 *       500:
 *         description: Server error
 */
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
 *       201:
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