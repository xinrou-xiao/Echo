const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, uinque: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
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
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema); 