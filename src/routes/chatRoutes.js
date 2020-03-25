const express = require('express');

const router = express.Router()

const chatCollection = require('../db/models/chatSchema');

router.get('/', async (req, res) => {
    console.log('request')
    res.status(200).json({})
})

module.exports = router