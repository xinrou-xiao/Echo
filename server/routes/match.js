const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const { User, TRIGGER_FIELDS } = require('../models/User');

/**
 * @swagger
 * components:
 *   schemas:
 *     FilteredUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         name:
 *           type: string
 *           description: User's name
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *           description: User's gender
 *         birthday:
 *           type: string
 *           format: date
 *           description: User's birthday
 *         height:
 *           type: number
 *           description: User's height in cm
 *         weight:
 *           type: number
 *           description: User's weight in kg
 *         picUrl:
 *           type: string
 *           description: URL of user's profile picture
 *         bio:
 *           type: string
 *           description: User's biography
 *         state:
 *           type: string
 *           description: User's state (only included if matches with requesting user)
 *         city:
 *           type: string
 *           description: User's city (only included if state matches with requesting user)
 *         language:
 *           type: string
 *           description: User's language (only included if matches with requesting user)
 *         occupation:
 *           type: string
 *           description: User's occupation (only included if matches with requesting user)
 *         mbti:
 *           type: string
 *           description: User's MBTI personality type (only included if matches with requesting user)
 *         commonInterests:
 *           type: array
 *           items:
 *             type: string
 *           description: Common interests between users (only included if there are matches)
 *     Match:
 *       type: object
 *       properties: 
 *         _id:
 *           type: string
 *           description: Match ID
 *         user1:
 *           type: string
 *           description: User ID
 *         user2:
 *           type: string
 *           description: User ID
 *         user1Response:
 *           type: string
 *           enum: ["like", "pass", "pending"]
 *           description: user 1 response
 *         user2Response:
 *           type: string
 *           enum: ["like", "pass", "pending"]
 *           description: user 2 response
 *         matchResult:
 *           type: string
 *           enum: ["success", "failed", "pending"]
 *           description: match status
 *     MatchResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             matchedUser:
 *               $ref: '#/components/schemas/FilteredUser'
 *             match:
 *               $ref: '#/components/schemas/Match'
 *     MatchUpdateRequest:
 *       type: object
 *       required:
 *         - response
 *       properties:
 *         response:
 *           type: string
 *           enum: [like, pass]
 *           description: User's response to the match
 */

/**
 * @swagger
 * /api/match/{_id}:
 *   get:
 *     summary: Get today's match for a user
 *     description: Retrieve today's matched user with filtered profile information showing only common attributes
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved today's match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchResponse'
 *       204:
 *         description: No match found for today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: No match for this user.
 *       404:
 *         description: User not found
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
 *                   example: user not found.
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/match/{_id}:
 *   patch:
 *     summary: Update user's response to today's match
 *     description: Submit user's response (like/pass) to today's match and update match result accordingly
 *     tags: [Matches]
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
 *             $ref: '#/components/schemas/MatchUpdateRequest'
 *           examples:
 *             likeResponse:
 *               summary: User likes the match
 *               value:
 *                 response: "like"
 *             passResponse:
 *               summary: User passes on the match
 *               value:
 *                 response: "pass"
 *     responses:
 *       200:
 *         description: Successfully updated match response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         description: User or match not found
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
 *                   example: User not found or No match for this user.
 *       500:
 *         description: Server error
 */
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

        let otherUserId = "";
        if (_id.toString() === match.user1.toString()) {
            match.user1Response = response;
            otherUserId = match.user2;
        } else {
            match.user2Response = response;
            otherUserId = match.user1;
        }

        await match.save();

        const updatedMatch = await Match.findById(match._id);
        if (updatedMatch.user1Response === "like" && updatedMatch.user2Response === "like") {
            updatedMatch.matchResult = "success";

            await updatedMatch.save();

            const otherUser = await User.findOne({ _id: otherUserId });

            if (!user.friends.includes(otherUserId)) {
                user.friends.push(otherUserId);
                await user.save();
            }

            if (!otherUser.friends.includes(_id)) {
                otherUser.friends.push(_id);
                await otherUser.save();
            }

        } else if (response === "pass") {
            updatedMatch.matchResult = "failed";
            await updatedMatch.save();
        }

        return res.json({
            success: true,
            data: updatedMatch
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