const mongoose = require('mongoose');

const similarityScoreSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    user1: { type: mongoose.Schema.Types.ObjectId, require: true },
    user2: { type: mongoose.Schema.Types.ObjectId, require: true },
    score: { type: Number, require: true },
}, { timestamps: true });

module.exports = mongoose.model("SimilarityScore", similarityScoreSchema);