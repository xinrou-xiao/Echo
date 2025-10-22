const express = require('express');
const router = express.Router();
const User = require('../models/User');

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
                user: user,
                isNewUser: false
            });
        } else {
            user = new User({
                email: email,
                uid: uid,
                name: name,
                picUrl: photoURL
            })

            await user.save();
            return res.json({
                success: true,
                user: user,
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

router.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.uid });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not exists.'
            });
        }

        res.json({
            success: true,
            user: user
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