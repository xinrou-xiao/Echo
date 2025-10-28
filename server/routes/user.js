const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { messaging } = require('firebase-admin');
const { route } = require('./auth');

/**
 * @swagger
 * /api/user/{_id}:
 *   get:
 *     summary: get user data
 *     description: get user data by given _id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
 *     responses:
 *       200:
 *         description: successfully query data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data: 
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               successResponse:
 *                 summary: successful
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     email: "james.brown@example.com"
 *                     uid: "sso_jkl901mno234"
 *                     name: "James Brown"
 *                     gender: "male"
 *                     birthday: "1990-05-30"
 *                     state: "Washington"
 *                     city: "Seattle"
 *                     language: "English"
 *                     occupation: "Data Scientist"
 *                     mbti: "INTP"
 *                     height: 175
 *                     weight: 68
 *                     personality: "Logical analyst who enjoys independent thinking"
 *                     interests: ["data analysis", "chess", "reading", "coffee"]
 *                     bio: "Data scientist with a passion for numbers and patterns"
 *                     picUrl: "https://example.com/images/james.jpg"
 *                     friends: []
 *       404:
 *         description: user not found
 *       500:
 *         description: server error or exception
 */
router.get('/:_id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params._id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        return res.json({
            success: true,
            data: user
        })
    } catch (err) {
        console.error('get /user/:_id api error:', err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

/**
 * @swagger
 * /api/user/friendList/{_id}:
 *   get:
 *     summary: get user's friends data
 *     description: get user's friends data by given _id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
 *     responses:
 *       200:
 *         description: successfully query data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: user not found
 *       500:
 *         description: server error or exception
 */
router.get('/friendList/:_id', async (req, res) => {
    try {
        const user = await User.findOne(
            { _id: req.params._id },
            { _id: 0, friends: 1 }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        const friendsId = user.friends || [];
        const friendsObject = [];

        for (const friendId of friendsId) {
            const friend = await User.findOne({ _id: friendId });
            if (friend) {
                friendsObject.push(friend);
            }
        }

        return res.json({
            success: true,
            data: friendsObject
        })
    } catch (err) {
        console.error('get /user/friendList/:_id api error:', err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

/**
 * @swagger
 * /api/user/{_id}:
 *   post:
 *     summary: update user profile data
 *     description: update user data with given id and profile json
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: user _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             example1:
 *               summary: example request
 *               value:
 *                 email: "james.brown@example.com"
 *                 name: "James Brown"
 *                 gender: "male"
 *                 birthday: "1990-05-30"
 *                 state: "Washington"
 *                 city: "Seattle"
 *                 language: "English"
 *                 occupation: "Data Scientist"
 *                 mbti: "INTP"
 *                 height: 175
 *                 weight: 68
 *                 interests: ["data analysis", "chess", "reading", "coffee"]
 *                 bio: "Data scientist with a passion for numbers and patterns"
 *                 picUrl: "https://example.com/images/james.jpg"
 *                 personality: "Logical analyst who enjoys independent thinking"
 *     responses:
 *       200:
 *         description: update request success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 _id: "6901255c63cbe60d533d7a14"
 *                 email: "james.brown@example.com"
 *                 uid: "sso_jkl901mno234"
 *                 name: "James Brown"
 *                 gender: "male"
 *                 birthday: "1990-05-30"
 *                 state: "Washington"
 *                 city: "Seattle"
 *                 language: "English"
 *                 occupation: "Data Scientist"
 *                 mbti: "INTP"
 *                 height: 175
 *                 weight: 68
 *                 personality: "Logical analyst who enjoys independent thinking"
 *                 interests: ["data analysis", "chess", "reading", "coffee"]
 *                 bio: "Data scientist with a passion for numbers and patterns"
 *                 picUrl: "https://example.com/images/james.jpg"
 *                 friends: []
 *       404:
 *         description: user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         description: server error or exception
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "server error."
 */
router.post('/:_id', async (req, res) => {
    try {
        const {
            name,
            gender,
            birthday,
            state,
            city,
            language,
            occupation,
            mbti,
            height,
            weight,
            personality,
            interests = [],
            bio,
            picUrl
        } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params._id },
            {
                $set: {
                    name,
                    gender,
                    birthday,
                    state,
                    city,
                    language,
                    occupation,
                    mbti,
                    height,
                    weight,
                    personality,
                    interests,
                    bio,
                    picUrl
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        return res.json({
            success: true,
            data: updatedUser
        });
    } catch (err) {
        console.error("post /:_id error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        })
    }
});

module.exports = router;