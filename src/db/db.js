const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');


const userCollection = require('./models/userSchema')

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(async (db) => {
        console.log('DB connected')
        /* let user = new userCollection({
            userName: 'Propietario 1',
            password: 'Propietario 1',
            rol: 'owner',
            name: 'Oscar Moreno'
        })  
        user.save()
        console.log('terminados') */
    }) 
    .catch((err) => {console.log(err)}) 