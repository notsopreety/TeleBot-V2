// thread.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    totalMsg: {
        type: Number,
        default: 0,
    },
    gcBan: {
        type: Boolean,
        default: false,
    },
});

const threadSchema = new Schema({
    chatId: {
        type: String,
        required: true,
        unique: true,
    },
    users: {
        type: Map,
        of: userSchema,
        default: {},
    },
    sorthelp: { // New field added
        type: Boolean,
        default: false,
    },
});

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;
