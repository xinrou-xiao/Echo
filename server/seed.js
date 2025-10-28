const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '/dummy_data', 'dummy_user.json'), 'utf8'));


async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await createUser();
    } catch (err) {
        console.error(err.message);
    } finally {
        mongoose.connection.close();
    }
}

const createUser = async () => {
    try {
        await User.deleteMany({});
        console.log('Cleared existing users');

        const createdUser = [];
        for (let userData of usersData) {
            userData.birthday = new Date(userData.birthday);

            const user = new User(userData);
            await user.save();
            createdUser.push(user);
        }
        console.log(`Successfully created ${usersData.length} users`);

        await buildFriendList(createdUser);
    } catch (err) {
        console.error("[createUser] error:", err.message);
    }
}

const buildFriendList = async (users) => {
    try {
        const user1 = users[0];
        const user2 = users[1];

        await User.findByIdAndUpdate(
            user1.id,
            { $set: { friends: [user2.id] } }
        );

        await User.findByIdAndUpdate(
            user2.id,
            { $set: { friends: [user1.id] } }
        );
        console.log("Successfully build friend relationship between frist two dummy user");
    } catch (err) {
        console.error("[buildFriendList] error:", err.message);
    }
}

main()