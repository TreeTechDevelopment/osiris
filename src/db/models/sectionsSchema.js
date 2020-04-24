const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sections = Schema({
    sectionName: {
        type: String,
        unique: true
    },
    coordinates: [{
        latitude: Number,
        longitude: Number
    }],
    employees: [{
        idEmployee: String
    }],
    owner: String,
    plants: String,
    finishRead: Boolean,
    temperature: {
        type: Number,
        default: 0
    },
    checkDateFrom : String,
    checkDateTo: String
})

module.exports = mongoose.model('sections', sections);