const mongoose = require('mongoose');

const matchSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user1: { type: mongoose.Schema.Types.ObjectId, require: true },
    user2: { type: mongoose.Schema.Types.ObjectId, require: true },
    user1Response: { type: Boolean, require: true, default: false },
    user2Response: { type: Boolean, require: true, default: false },
    matchResult: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Mathch", matchSchema);