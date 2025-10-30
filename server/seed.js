const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User } = require('./models/User');
const Messasge = require('./models/Message');
const Match = require('./models/Match');
const SimilarityScore = require('./models/SimilarityScore');
const fs = require('fs');
const path = require('path');
const Message = require('./models/Message');
const { MatchingService } = require('./cron/dailyMatch');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '/dummy_data', 'dummy_user.json'), 'utf8'));
const messagesData = JSON.parse(fs.readFileSync(path.join(__dirname, '/dummy_data', 'dummy_message.json'), 'utf8'));

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/echoDB");
        await SimilarityScore.deleteMany();
        const createdUser = await createUser();
        await MatchingService.generateDailyMatches();
        // await createMatchs(createdUser);
        await createMessages(createdUser);
    } catch (err) {
        console.error(err.message);
    } finally {
        mongoose.connection.close();
    }
}

const createMatchs = async (createdUser) => {
    try {
        await Match.deleteMany();

        const match1 = new Match(
            {
                user1: createdUser[0],
                user2: createdUser[1],
                user1Response: "like",
                user2Response: "like",
                matchResult: "success"
            }
        );

        const match2 = new Match(
            {
                user1: createdUser[3],
                user2: createdUser[4],
            }
        );

        await match1.save();
        await match2.save();

        console.log(`[createMatchs] Successfully created match between frist two dummy users and the last two dummy users.`);
    } catch (err) {
        console.error("[createMatchs] error:", err);
    }
};

const createMessages = async (createdUser) => {
    try {
        await Message.deleteMany();

        const user1Id = createdUser[0]._id;
        const user2Id = createdUser[1]._id;

        for (let i = 0; i < messagesData.length; i++) {
            let receiverId = user1Id, senderId = user2Id;
            if (i % 2 == 1) {
                receiverId = user2Id;
                senderId = user1Id;
            }
            const Message = new Messasge(
                {
                    receiverId: receiverId,
                    senderId: senderId,
                    content: messagesData[i]
                }
            );
            await Message.save();
        }
        console.log(`[createMessage] Successfully created ${messagesData.length} meesage between frist two dummy users.`);
    } catch (err) {
        console.error("[createMessage] error:", err);
    }
};

const createUser = async () => {
    try {
        await User.deleteMany({});

        const createdUser = [];
        for (let userData of usersData) {
            userData.birthday = new Date(userData.birthday);

            const user = new User(userData);
            await user.save();
            createdUser.push(user);
        }
        console.log(`[createUser] Successfully created ${usersData.length} users`);

        await buildFriendList(createdUser);
        return createdUser;
    } catch (err) {
        console.error("[createUser] error:", err.message);
        return [];
    }
}

const buildFriendList = async (users) => {
    try {
        const user1 = users[0];
        const user2 = users[1];

        await User.findByIdAndUpdate(
            user1._id,
            { $set: { friends: [user2._id] } }
        );

        await User.findByIdAndUpdate(
            user2._id,
            { $set: { friends: [user1._id] } }
        );
        console.log("[buildFriendList] Successfully built friend relationship between frist two dummy users");
    } catch (err) {
        console.error("[buildFriendList] error:", err.message);
    }
}

main()