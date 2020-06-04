const getStream = require('into-stream');

const buyCollection = require('../db/models/buySchema')

const { containerNameDocs, blobService, getDocURL} = require('../azure')
const { createPDF } = require('../pdf');
const { sendEmail } = require('../nodemailer');

const postBuy = (req, res) => {
    try{
        const { files } = req
        const { name, weight, section, date, total } = req.body
        let photoBuffer = null
        let signBuffer = null
        for(let i = 0; i < files.length; i++){
            if(files[i].originalname.split('_')[1] === "photo"){ photoBuffer = files[i].buffer }
            else{ signBuffer = files[i].buffer }
        }
        createPDF(name, total, weight, date, signBuffer,  photoBuffer).then(({err, data}) => {
            if(err){ console.log(err); return res.sendStatus(500) }
            sendEmail(data, (fileName, path) => {
                blobService.createBlockBlobFromLocalFile(containerNameDocs, fileName, path, (err, response) => {
                    if(err){ console.log(err); return res.sendStatus(500) }
                    let buy = new buyCollection({
                        document: getDocURL(fileName),
                        name,
                        weight,
                        section,
                        date,
                        total
                    })
                    buy.save()
                    res.json({ created: true, buy })
                })
            })
        }).catch(e => {
            console.log(e)
            res.sendStatus(500)
        })
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}

const getBuys = async (req, res) => {
    try{
        const buys = await buyCollection.find({})
        res.json({ buys })
    }catch(e){
        res.sendStatus(500)
    }
}

const deleteBuy = async (req, res) => {
    try{
        const buy = await buyCollection.findById(req.params.id)
        blobService.deleteBlobIfExists(containerNameDocs, buy.photo.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        })
        blobService.deleteBlobIfExists(containerNameDocs, buy.sign.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500) 
                return;
            }
        })
        await buyCollection.findByIdAndRemove(req.params.id)
        res.json({ deleted: true, buy })
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}

module.exports = {
    postBuy,
    getBuys,
    deleteBuy
}