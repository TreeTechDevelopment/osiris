const express = require('express');

const router = express.Router()

const chatCollection = require('../db/models/chatSchema');

router.get('/', async (req, res) => {
    let chats = await chatCollection.find()
    res.status(200).json({ chats })
})

module.exports = router