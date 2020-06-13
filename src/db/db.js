const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');

const Collection = require('./models/plantSchema')

mongoose.connect(process.env.DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true})
    .then(async (db) => {
        console.log('DB connected') 
        let plantsOwned = await Collection.find({ 'owned': false }).sort({ serialNumber: 1 })


        for( let i = 0; i < 100; i++ ){
            plantsOwned[i].owned = true
            plantsOwned[i].owner = '5ee1c281614bf32e5c0ed060'
            plantsOwned[i].save()
        }


        console.log('TERMINADO')
    }) 
    .catch((err) => {console.log(err)}) 