const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = Schema({
    from: String,
    to: String,
    chat: [{
        date: String,
        message: String,
        userName: String
    }],
    days: {
        type: Number,
        default: 1
    }  
})

module.exports = mongoose.model('Chats', chatSchema);