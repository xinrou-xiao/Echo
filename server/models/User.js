const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    email: { type: String, required: true, unique: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    birthday: Date,
    location: String,
    language: String,
    occupation: String,
    MBTI: String,
    height: Number,
    weight: Number,
    interests: { type: [String], default: [] },
    bio: String,
    picUrl: String,
    personality: String,
    friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema); 