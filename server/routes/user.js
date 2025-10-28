const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { messaging } = require('firebase-admin');

router.get('/:_id', async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params._id });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        res.json({
            success: true,
            user: user
        })
    } catch (err) {
        console.error('get /user/:_id api error', err);
        res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

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

        res.json({
            success: true,
            friends: friendsObject
        })
    } catch (err) {
        console.error('get /user/friendList/:_id api error', err);
        res.status(500).json({
            success: false,
            message: 'server error.'
        });
    }
});

module.exports = router;