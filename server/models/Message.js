const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, require: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, require: true },
    content: { type: String, require: true },
}, { timestamps: true });

module.exports = mongoose.model("Messagge", messageSchema);