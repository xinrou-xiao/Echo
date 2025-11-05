const mongoose = require('mongoose');
const SimilarityScore = require('./SimilarityScore');

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    birthday: Date,
    state: String,
    city: String,
    language: String,
    occupation: String,
    mbti: String,
    height: Number,
    weight: Number,
    interests: { type: [String], default: [] },
    bio: String,
    picUrl: String,
    personality: String,
    food: String,
    vibe: String,
    music: String,
    movie: String,
    weather: String,
    friendQuality: String,
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

const TRIGGER_FIELDS = ['state', 'language', 'occupation', 'mbti', 'interests', 'personality', 'food', 'vibe', 'music', 'movie', 'weather', 'friendQuality'];

const calculateSimilarityScore = async (_id) => {
    try {
        const User = mongoose.model("User");

        const user = await User.findOne({ _id: _id });
        if (!user) {
            console.log(`User ${_id} not found`);
            return false;
        }

        const otherUsers = await User.find({ _id: { $ne: _id } });

        for (let otherUser of otherUsers) {
            const userA = user._id < otherUser._id ? user : otherUser;
            const userB = user._id > otherUser._id ? user : otherUser;

            const compatibility = {};

            TRIGGER_FIELDS.forEach(field => {
                if (field === 'interests') {
                    compatibility.commonInterests = userA.interests.filter(interest =>
                        userB.interests.includes(interest)
                    );
                } else {
                    compatibility[`same${field.charAt(0).toUpperCase() + field.slice(1)}`] =
                        userA[field] === userB[field];
                }
            });

            compatibility.score = Object.values(compatibility).filter(val =>
                val === true || (Array.isArray(val) && val.length > 0)
            ).length;

            await SimilarityScore.findOneAndUpdate(
                {
                    user1: userA._id,
                    user2: userB._id
                },
                {
                    score: compatibility.score
                },
                {
                    upsert: true,
                    new: true,
                    runValidators: true
                }
            );
        }
        return true;
    } catch (err) {
        console.error(`[calculateSimilarityScore] calculate similarity score for user ${_id} error:`, err);
        return false;
    }
};

userSchema.post('findOneAndUpdate', async function (result) {
    try {
        if (!result) return;

        const update = this.getUpdate();
        const updatedFields = Object.keys(update.$set || {});
        const ifTrigger = updatedFields.some(field => TRIGGER_FIELDS.includes(field));

        if (ifTrigger) {
            calculateSimilarityScore(result._id).catch(console.error);
        }
    } catch (err) {
        console.error(`[User] findOneAndUpdate middleware error while processing user ${user._id}:`, err);
    }
});

userSchema.post('save', async function (user) {
    try {
        const fields = Object.keys(user.$set || {});
        const ifTrigger = TRIGGER_FIELDS.some(field =>
            user[field] !== undefined && user[field] !== null
        );

        if (ifTrigger) {
            calculateSimilarityScore(user._id).catch(console.error);
        }
    } catch (err) {
        console.error(`[User] save middleware error while processing user ${user._id}:`, err);
    }
});

module.exports = {
    User: mongoose.model("User", userSchema),
    TRIGGER_FIELDS
};