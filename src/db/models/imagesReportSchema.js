const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imagesReport = Schema({
    plantId: String,
    images: [{
        data: Buffer
    }]
})

module.exports = mongoose.model('ImagesReport', imagesReport);