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

mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(async (db) => {
        console.log('DB connected')
        /* let user = await userCollection.findOne({ 'rol': 'employee' })
        let todos = [{
            title: 'Tarea 1',
            todo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            status: false
        },{
            title: 'Tarea 2',
            todo: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            status: false
        }]
        user.todos = todos
        user.save()
        console.log('terminado') */
    }) 
    .catch((err) => {console.log(err)}) 