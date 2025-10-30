const cron = require('node-cron');
const { User } = require('../models/User');
const Match = require('../models/Match');
const SimilarityScore = require('../models/SimilarityScore');


class DailyMatchingScheduler {
    static init() {
        cron.schedule('0 0 * * *', async () => {
            console.log('Daily match cron job triggered at midnight everyday.');
            try {
                await MatchingService.generateDailyMatches();
            } catch (err) {
                console.error('[DailyMatchingScheduler] [init] error:', err)
            }
        }, {
            scheduled: true,
            timezone: 'America/Los_Angeles'
        });

        console.log('Daily match scheduler initiated.');
    }
}

class MatchingService {
    static async generateDailyMatches() {
        try {
            const users = await User.find({});
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            await Match.deleteMany({
                createdAt: { $gte: today }
            });

            const matches = [];
            const matchedUserIds = new Set();

            for (let user of users) {
                if (matchedUserIds.has(user._id.toString())) {
                    continue;
                }

                const match = await this.findBestMatchForUser(user, users, matchedUserIds, sevenDaysAgo);
                if (match) {
                    matches.push(match);

                    matchedUserIds.add(match.user1.toString());
                    matchedUserIds.add(match.user2.toString());
                }
            }

            if (matches.length > 0) {
                await Match.insertMany(matches);
                console.log(`Successfully created ${matches.length} daily matches`);
            } else {
                console.log('No matches created today');
            }

            return matches;

        } catch (err) {
            console.error('Error generating daily matches:', err);
            throw err;
        }
    }

    static async findBestMatchForUser(user, allUsers, matchedUserIds, sevenDaysAgo) {
        try {
            const userWithFriends = await User.findById(user._id).populate('friends');
            const friendIds = userWithFriends.friends.map(friend => friend._id.toString());

            const availableUsers = allUsers.filter(u =>
                u._id.toString() !== user._id.toString() &&
                !matchedUserIds.has(u._id.toString()) &&
                !friendIds.includes(u._id.toString())
            );

            if (availableUsers.length === 0) {
                return null;
            }

            const recentMatches = await Match.find({
                $or: [
                    { user1: user._id },
                    { user2: user._id }
                ],
                createdAt: { $gte: sevenDaysAgo }
            });

            const passedUserIds = new Set();
            recentMatches.forEach(match => {
                const isUser1 = match.user1.toString() === user._id.toString();
                const otherUserId = isUser1 ? match.user2.toString() : match.user1.toString();

                if ((isUser1 && match.user1Response === 'pass') ||
                    (!isUser1 && match.user2Response === 'pass')) {
                    passedUserIds.add(otherUserId);
                }
            });

            const filteredUsers = availableUsers.filter(u =>
                !passedUserIds.has(u._id.toString())
            );

            if (filteredUsers.length === 0) {
                return null;
            }

            const similarityScores = await SimilarityScore.find({
                $or: [
                    { user1: user._id },
                    { user2: user._id }
                ]
            }).populate('user1 user2');

            let bestMatch = null;
            let highestScore = -1;

            for (let score of similarityScores) {
                const otherUserId = score.user1.toString() === user._id.toString()
                    ? score.user2
                    : score.user1;

                const otherUser = filteredUsers.find(u => u._id.toString() === otherUserId.toString());

                if (otherUser && score.score > highestScore) {
                    highestScore = score.score;
                    bestMatch = otherUser;
                }
            }

            if (bestMatch) {
                const user1 = user._id < bestMatch._id ? user._id : bestMatch._id;
                const user2 = user._id > bestMatch._id ? user._id : bestMatch._id;

                return new Match({
                    user1,
                    user2,
                });
            }

            return null;

        } catch (err) {
            console.error(`Error finding match for user ${user._id}:`, err);
            return null;
        }
    }
}

module.exports = {
    DailyMatchingScheduler,
    MatchingService
};