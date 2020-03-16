const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const plantSchema = Schema({
    name: String,
    temperature: Number,
    numberFruits: Number,
    width: Number,
    height: Number,
    provider: String,
    type: String,
    dateBuy: String,
    serialNumber: String
})

module.exports = mongoose.model('Plants', plantSchema);