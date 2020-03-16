const mongoose = require('mongoose');
//const qr = require('qr-image');
//const path = require('path');
//const fs = require('fs');
//const text2png = require('text2png');
//require('babel-polyfill');
//const brandedQRCode = require('branded-qr-code')
//const PDFDocument = require('pdfkit');

const DB = 'mongodb+srv://dbAdmin:Qwpoaslk1_@kaffeeqrapp-8byv0.mongodb.net/test?retryWrites=true&w=majority'

const plantCollection = require('./schemas/plantSchema')

mongoose.connect(DB, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(async (db) => {
        console.log('DB connected')
        //const doc = new PDFDocument({size: 'TABLOID'});                 
        /* for(let i = 1; i < 9001; i++){
            let serialNumber = ''
            if(i < 10){ serialNumber = `000${i}` }
            if(i < 100 && i >= 10){ serialNumber = `00${i}` }
            if(i < 1000 && i >= 100){ serialNumber = `0${i}` }
            if(i >= 1000){ serialNumber = `${i}` }
            let plant = await plantCollection.findOne({'serialNumber': serialNumber})
            brandedQRCode.generate({text: plant._id.toString(), path: `../../../QRBrand/brand${serialNumber}.png`, ratio: 4.5, opt: {width: 300, margin:0}}).then((buf) => {
                fs.writeFileSync(path.join(__dirname,`../../QR/QR${serialNumber}.png`),buf,(err) => {
                    if(err){
                        console.log(err)
                    }else{
                        console.log('saved')
                    } 
                })
            })
        } */

        /* const cmToPt = cm =>  {
            return cm * 28.3465;
        }        
        doc.pipe(fs.createWriteStream(path.join(__dirname,`../../QRs.pdf`))); // write to PDF
        let serialNumber = 1
        let serialNumberString = ''
        for(let k = 0; k < 141; k++){
            for(let i = 0; i < 8; i++){
                for(let j = 0; j < 8; j++){
                    if(serialNumber < 10){ serialNumberString = `000${serialNumber}` }
                    if(serialNumber < 100 && serialNumber >= 10){ serialNumberString = `00${serialNumber}` }
                    if(serialNumber < 1000 && serialNumber >= 100){ serialNumberString = `0${serialNumber}` }
                    if(serialNumber >= 1000){ serialNumberString = `${serialNumber}` }
                    let separacion = cmToPt(0.25);                    
                    if(serialNumber !== 9001){
                    doc.image(path.join(__dirname,`../../QR/QR${serialNumberString}.png`), (j * cmToPt(3)) + ((j) * cmToPt(0.5)) + separacion, (cmToPt(2) * (i+1)) + (cmToPt(3) * i), {width: cmToPt(3)})
                    serialNumber++}
                }                
            }            
            console.log(k)
            if(k !== 140){ doc.addPage({size: 'TABLOID'}) }            
        } */                  
        //doc.image(path.join(__dirname,`../../QR/QR0002.png`), cmToPt(3.5), cmToPt(2), {width: cmToPt(3)})                    
        
        //doc.end();
        //console.log('terminado')  
        /* fs.writeFileSync('QRBrand/brand1.png', text2png('0001', { 
            color: 'black', 
            padding: 10, 
            backgroundColor: 'white', 
            font: '100px sans-serif'}));  
        brandedQRCode.generate({text: '0001', path: '../../../QRBrand/brand1.png', ratio: 4.5, opt: {width: 300}}).then((buf) => {
            fs.writeFileSync(path.join(__dirname,'../../QR/output1.png'),buf,(err) => {
                if(err){
                    console.log(err)
                }else{
                    console.log('saved') 
                }  
            })
        }) */
    }) 
    .catch((err) => {console.log(err)}) 