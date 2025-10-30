const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user1: { type: mongoose.Schema.Types.ObjectId, require: true },
    user2: { type: mongoose.Schema.Types.ObjectId, require: true },
    user1Response: { type: String, enum: ["like", "pass", "pending"], require: true, default: "pending" },
    user2Response: { type: String, enum: ["like", "pass", "pending"], require: true, default: "pending" },
    matchResult: { type: String, enum: ["success", "failed", "pending"], require: true, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Mathch", matchSchema);