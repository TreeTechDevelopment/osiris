const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sections = Schema({
    sectionName: String,
    coordinates: [{
        latitude: Number,
        longitude: Number,
        id: Number,
        uniqueId: Number
    }],
    employees: [{
        idEmployee: String,
        userName: String
    }],
    owner: String,
    plants: String,
    finishRead: Boolean,
    temperature: Number
})

module.exports = mongoose.model('sections', sections);