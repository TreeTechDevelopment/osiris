const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');

const DB = 'mongodb+srv://dbAdmin:Qwpoaslk1_@kaffeeqrapp-8byv0.mongodb.net/test?retryWrites=true&w=majority'

const plantCollection = require('./models/plantSchema')

mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(async (db) => {
        console.log('DB connected')
        /* let plants = await plantCollection.find()
        for(let i = 7000; i < plants.length; i++){
            plants[i].statusReported = false
            plants[i].save()
            if(i === 1000){ console.log(i) }
            if(i === 3000){ console.log(i) }
            if(i === 6000){ console.log(i) }
            if(i === 8000){ console.log(i) }
        }
        console.log('terminado') */
    }) 
    .catch((err) => {console.log(err)}) 