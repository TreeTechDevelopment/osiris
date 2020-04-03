const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');

const DB = 'mongodb+srv://dbAdmin:Qwpoaslk1_@kaffeeqrapp-8byv0.mongodb.net/test?retryWrites=true&w=majority'

const userCollection = require('./models/userSchema')

mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(async (db) => {
        console.log('DB connected')
        /* let user = await userCollection.findOne({ 'rol': 'employee' })
        user.plants = '0001 - 2000'
        user.save()
        console.log('terminado') */
    }) 
    .catch((err) => {console.log(err)}) 