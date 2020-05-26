const getStream = require('into-stream');

const buyCollection = require('../db/models/buySchema')

const {getBlobName, containerName, blobService, getFileUrl} = require('../azure')

const postBuy = (req, res) => {
    try{
        const { files } = req
        const { name, weight, section, date, total } = req.body
        let newBuy = {}
        for(let i = 0; i < files.length; i++){
            let blobName = getBlobName(files[i].originalname)
            let stream = getStream(files[i].buffer)
            let streamLength = files[i].buffer.length
            blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
                if(err) {
                    res.sendStatus(500)
                    return;
                }
            });
            if(files[i].originalname.split('_')[1] === "photo"){ newBuy.photo = getFileUrl(blobName) }
            else{ newBuy.sign = getFileUrl(blobName) }
        }
        newBuy.name = name
        newBuy.weight = weight
        newBuy.section = section
        newBuy.date = date
        newBuy.total = total
        let buy = new buyCollection(newBuy)
        buy.save()
        res.json({ created: true, buy: newBuy })
    }catch(e){
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
        blobService.deleteBlobIfExists(containerName, buy.photo.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        })
        blobService.deleteBlobIfExists(containerName, buy.sign.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        })
        await buyCollection.findByIdAndRemove(req.params.id)
        res.json({ deleted: true, buy })
    }catch(e){
        res.sendStatus(500)
    }
}

module.exports = {
    postBuy,
    getBuys,
    deleteBuy
}