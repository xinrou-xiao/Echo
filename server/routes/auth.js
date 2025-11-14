const express = require('express');
const router = express.Router();
const { User } = require('../models/User');

/**
 * @swagger
 * /api/auth/verify_user:
 *   post:
 *     summary: verify user and auto sign up
 *     description: user google SSO to verify user, if user not exists in our system, automatically sign up for them
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [uid, email, name]
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Google SSO uid
 *               email:
 *                 type: string
 *                 format: email
 *                 description: user google account's email
 *                 example: "james.brown@example.com"
 *               name:
 *                 type: string
 *                 description: user google account's name
 *                 example: "James Brown"
 *               photoURL:
 *                 type: string
 *                 format: uri
 *                 description: user google account's photo
 *                 example: "https://example.com/images/james.jpg"
 *           examples:
 *             example1:
 *               summary: authentication request example
 *               value:
 *                 uid: "sso_jkl901mno234"
 *                 email: "james.brown@example.com"
 *                 name: "James Brown"
 *                 photoURL: "https://example.com/images/james.jpg"
 *     responses:
 *       200:
 *         description: validation successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 isNewUser:
 *                   type: boolean
 *                   description: is new user in our system
 *             examples:
 *               existingUser:
 *                 summary: existing user response
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
 *                   isNewUser: false
 *               newUser:
 *                 summary: new user response
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     email: "james.brown@example.com"
 *                     uid: "sso_jkl901mno234"
 *                     name: "James Brown"
 *                     picUrl: "https://example.com/images/james.jpg"
 *                     friends: []
 *                   isNewUser: true
 *       400:
 *         description: invalid format example
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               invalidFormat:
 *                 summary: invalid format example
 *                 value:
 *                   success: false
 *                   message: "invalid format."
 *       500:
 *         description: sever error example
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               serverError:
 *                 summary: sever error example
 *                 value:
 *                   success: false
 *                   message: "server error."
 */

/**4 Back in the service, we normalize the response, store it in a signal and Local Storage, 
 * and if it’s a new user we navigate to /profile. Our components then use this stored 
 * user data to render UI or decide navigation.*/

router.post('/verify_user', async (req, res) => {
    try {
        const { uid, email, name, photoURL } = req.body;

        if (!uid || !email || !name) {
            return res.status(400).json({
                success: false,
                message: 'invalid fomat.'
            });
        }

        let user = await User.findOne({ uid });

        if (user) {
            return res.json({
                success: true,
                data: user,
                isNewUser: false
            });
        } else {
            user = new User({
                email: email,
                uid: uid,
                name: name,
                picUrl: photoURL,
                friends: []
            })

            await user.save();
            return res.json({
                success: true,
                data: user,
                isNewUser: true
            });
        }
    } catch (err) {
        console.error('verify_user api error', err);
        res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

/**
 * @swagger
 * /api/auth/user/{uid}:
 *   get:
 *     summary: get user data by given uid
 *     description: get user data by given uid
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *           example: "sso_jkl901mno234"
 *         description: Google SSO uid
 *     responses:
 *       200:
 *         description: successfully get user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               successResponse:
 *                 summary: successfully get user data response
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               userNotFound:
 *                 summary: user not found example
 *                 value:
 *                   success: false
 *                   message: "user not found."
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               serverError:
 *                 summary: server error example
 *                 value:
 *                   success: false
 *                   message: "server error."
 */
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        res.json({
            success: true,
            data: user
        })
    } catch (err) {
        console.error('verify_user api error', err);
        res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

module.exports = router;