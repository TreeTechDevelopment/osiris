const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');

const moment = require('moment')
const Collection = require('./models/plantSchema')

const { checkDate } = require('../helpers')  

mongoose.connect(process.env.DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true})
    .then(async (db) => {
        console.log('DB connected') 
        /* let section = new Collection({
            sectionName: 'A',
            coordinates: [{
                latitude: 25.51,
                longitude: -103.5
            },{
                latitude: 25.51,
                longitude: -103.52
            },{
                latitude: 25.49,
                longitude: -103.52
            },{
                latitude: 25.49,
                longitude: -103.5
            }],
            employees: [{
                idEmployee: "5e5c53fb7ad29d3d60e99005"
            }],
            owner: "5e8e5c00cffc58420838ddde",
            plants: "0001-0010",
            finishRead: false,
            temperature: 24
        })
        section.save() */
        /* sectionName: String,
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
    temperature: Number */
        /* try{
            console.log(moment('2020-04-21').isBetween('2020-03-21', '2020-05-21'))
        }catch(e){ console.log("error") } */
        //await Collection.findByIdAndRemove('5eb21be4c3c7c02b44a5fe34')
        //let date = '15/05/2020'
        //let date = moment([2020, 5, 08]).add(28, 'days')

        //console.log(moment(date._d, "MM-DD-YYYY"))
        //console.log(moment(moment().toDate()).format('DD/MM/YYYY'))
        /* let plants = await Collection.find({ 'serialNumber': { $gte: '0010', $lte: '0020' } })
        console.log(plants)
        console.log(plants.length) */
    }) 
    .catch((err) => {console.log(err)}) 