const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');


const Collection = require('./models/plantSchema')

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(async (db) => {
        console.log('DB connected')        
    }) 
    .catch((err) => {console.log(err)}) 