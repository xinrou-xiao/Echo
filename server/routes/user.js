const express = require('express');
const router = express.Router();
const { User } = require('../models/User');

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
 * /api/user/friend-list/{_id}:
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
router.get('/friend-list/:_id', async (req, res) => {
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
 *   put:
 *     summary: Update user profile
 *     description: Update user data with specified ID and profile information
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *               language:
 *                 type: string
 *               occupation:
 *                 type: string
 *               mbti:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               personality:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               picUrl:
 *                 type: string
 *               food:
 *                 type: string
 *               vibe:
 *                 type: string
 *               music:
 *                 type: string
 *               movie:
 *                 type: string
 *               weather:
 *                 type: string
 *               friendQuality:
 *                 type: string
 *           examples:
 *             example1:
 *               summary: Example update request
 *               value:
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
 *                 food: "Italian"
 *                 vibe: "Chill"
 *                 music: "Jazz"
 *                 movie: "Inception"
 *                 weather: "Sunny"
 *                 friendQuality: "Loyal"
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *             example:
 *               success: true
 *               data:
 *                 _id: "6901255c63cbe60d533d7a14"
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
 *                 food: "Italian"
 *                 vibe: "Chill"
 *                 music: "Jazz"
 *                 movie: "Inception"
 *                 weather: "Sunny"
 *                 friendQuality: "Loyal"
 *       400:
 *         description: User does not exist
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "user do not exist."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "user not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "server error."
 */
router.put('/:_id', async (req, res) => {
    try {
        const {
            name,
            gender,
            birthday,
            location,
            language,
            occupation,
            mbti,
            height,
            weight,
            personality,
            interests = [],
            bio,
            profilePicture,
            food,
            vibe,
            music,
            movie,
            weather,
            friendQuality
        } = req.body;

        const { state, city } = location || {};
        const picUrl = profilePicture?.url;

        const userExists = await User.exists({ _id: req.params._id });
        if (!userExists) {
            return res.status(400).json({
                success: false,
                message: 'user do not exist.'
            });
        }

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
                    picUrl,
                    food,
                    vibe,
                    music,
                    movie,
                    weather,
                    friendQuality
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
        console.error("put /:_id error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        })
    }
});

module.exports = router;