const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { User, TRIGGER_FIELDS } = require('../models/User');

router.get('/:_id', async (req, res) => {
    try {
        const _id = req.params._id;
        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const match = await Match.findOne({
            $or:
                [
                    { user1: _id },
                    { user2: _id }
                ],
            createdAt: {
                $gte: today
            }
        });

        if (!match) {
            return res.status(204).json({
                success: true,
                message: 'No match for this user.'
            });
        }

        let matchedUser = null;
        if (match.user1 == _id) {
            matchedUser = await User.findOne({ _id: match.user2 });
        } else {
            matchedUser = await User.findOne({ _id: match.user1 });
        }

        const filteredMatchedUser = {
            _id: matchedUser._id,
            name: matchedUser.name,
            gender: matchedUser.gender,
            birthday: matchedUser.birthday,
            height: matchedUser.height,
            weight: matchedUser.weight,
            picUrl: matchedUser.picUrl,
            bio: matchedUser.bio
        };

        TRIGGER_FIELDS.forEach(field => {
            if (user[field] !== undefined &&
                matchedUser[field] !== undefined &&
                user[field] === matchedUser[field]) {
                filteredMatchedUser[field] = user[field];
            }
        });

        if ("state" in filteredMatchedUser) {
            filteredMatchedUser[city] = matchedUser.city;
        }

        if (user.interests && matchedUser.interests) {
            const commonInterests = user.interests.filter(interest =>
                matchedUser.interests.includes(interest)
            );
            if (commonInterests.length > 0) {
                filteredMatchedUser.commonInterests = commonInterests;
            }
        }

        return res.json({
            success: true,
            data: {
                matchedUser: filteredMatchedUser,
                match: match
            }
        })
    } catch (err) {
        console.error("get /api/match error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        })
    }
});

router.patch('/:_id', async (req, res) => {
    try {
        const _id = req.params._id;
        const { response } = req.body;

        const user = await User.findOne({ _id: _id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found.'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const match = await Match.findOne({
            $or:
                [
                    { user1: _id },
                    { user2: _id }
                ],
            createdAt: {
                $gte: today
            }
        });

        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'No match for this user.'
            });
        }

        if (_id == match.user1) {
            match.user1Response = response;
        } else {
            match.user2Response = response;
        }

        if (match.user1Response == "like" && match.user2Response == "like") {
            match.matchResult = "success";
        } else if (response == "pass") {
            match.matchResult = "failed";
        }

        await match.save();

        return res.json({
            success: true,
            data: match
        });
    } catch (err) {
        console.error("patch /api/match error:", err);
        return res.status(500).json({
            success: false,
            message: 'server error.'
        })
    }
});

module.exports = router;