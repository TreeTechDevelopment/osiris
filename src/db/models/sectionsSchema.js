const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sections = Schema({
    sectionName: String,
    coordinates: [{
        latitude: Number,
        longitude: Number
    }]
})

module.exports = mongoose.model('sections', sections);