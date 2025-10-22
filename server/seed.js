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
        // clean old data

        await User.deleteMany({});
        console.log('Cleared existing users');

        for (let userData of usersData) {
            userData.birthday = new Date(userData.birthday);

            const user = new User(userData);
            await user.save();
        }
        console.log(`Successfully created ${usersData.length} users`);
    } catch (err) {
        console.error(err.message);
    }
}

main()