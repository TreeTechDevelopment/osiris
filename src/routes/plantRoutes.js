const express = require('express');
const multer = require('multer');
const getStream = require('into-stream');

const router = express.Router()
const inMemoryStorage = multer.memoryStorage()
const upload = multer({ storage: inMemoryStorage })

const {getBlobName, containerName, blobService, getFileUrl} = require('../azure')

const plantCollection = require('../db/models/plantSchema');

router.get('/', async (req, res) => {
    const { id, from, to } = req.query    
    if(id){
        let plant = await plantCollection.findById(id)
        if(plant){
            res.status(200).json({plant, status: true})
        }else{
            res.status(200).json({plant, status: false}) 
        }
    }else{
        let plants = [] 
        for(let i = from; i < to; i++){
            let serialNumber = ''
            if(i < 10){ serialNumber = `000${i}` }
            if(i >= 10 && i < 100){ serialNumber = `00${i}` }
            if(i >= 100 && i < 1000){ serialNumber = `0${i}` }
            if(i >= 1000){ serialNumber = `${i}` }
            let plant = await plantCollection.findOne({ 'serialNumber': serialNumber })
            plants.push(plant)
        }
        res.status(200).json({plants, status: false}) 
    }   
})

router.get('/reports', async (req,res) => {
    let plants = await plantCollection.find({ statusReported: true })    
    res.status(200).json({ plants })
}) 

router.get('/numberFruits', async (req,res) => {
    const { query, value } = req.query 
    let plants = []
    switch(query){
        case 'more':
            plants = await plantCollection.find({ 'numberFruits': { $gt : value} }) 
            break;
        case 'less':
            plants = await plantCollection.find({ 'numberFruits': { $lt : value} }) 
            break
        case 'equal':
            plants = await plantCollection.find({ 'numberFruits': value }) 
            break
    }    
    res.status(200).json({ plants })
})

router.get('/width', async (req,res) => {
    const { query, value } = req.query 
    let plants = []
    switch(query){
        case 'more':
            plants = await plantCollection.find({ 'width': { $gt : value} }) 
            break;
        case 'less':
            plants = await plantCollection.find({ 'width': { $lt : value} }) 
            break
        case 'equal':
            plants = await plantCollection.find({ 'width': value }) 
            break
    }    
    res.status(200).json({ plants })
})

router.get('/height', async (req,res) => {
    const { query, value } = req.query 
    let plants = []
    switch(query){
        case 'more':
            plants = await plantCollection.find({ 'height': { $gt : value} }) 
            break;
        case 'less':
            plants = await plantCollection.find({ 'height': { $lt : value} }) 
            break
        case 'equal':
            plants = await plantCollection.find({ 'height': value }) 
            break
    }    
    res.status(200).json({ plants })
})

router.get('/specific', async (req,res) => {
    const { serialNumber, width, widthType, height, heightType, numberFruits, numberFruitsType, section } = req.query
    let plants = []
    let queryObject = {}
    if(serialNumber !== ''){
        let number = ''
        if(parseInt(serialNumber) >= 0){ number = `000${serialNumber}` }
        if(parseInt(serialNumber) >= 10){ number = `00${serialNumber}` }
        if(parseInt(serialNumber) >= 100){ number = `0${serialNumber}` }
        if(parseInt(serialNumber) >= 1000){ number = `${serialNumber}` }
        plants = await plantCollection.find({ 'serialNumber': number })        
    }else{        
        if(width !== ""){
            if(widthType === 'more'){
                queryObject.width = { $gt: parseInt(width) }
            }
            if(widthType === 'less'){
                queryObject.width = { $lt: parseInt(width) }
            }
        }
        if(height !== ""){
            if(heightType === 'more'){
                queryObject.height = { $gt: parseInt(height) }
            }
            if(heightType === 'less'){
                queryObject.height = { $lt: parseInt(height) }
            }
        }
        if(numberFruits !== ""){
            if(numberFruitsType === 'more'){
                queryObject.numberFruits = { $gt: parseInt(numberFruits) }
            }
            if(numberFruitsType === 'less'){
                queryObject.numberFruits = { $lt: parseInt(numberFruits) }
            }
        }
        if(section !== ""){
            queryObject.section = section
        }
        plants = await plantCollection.find(queryObject)
    }    
    res.status(200).json({ plants })
        
})

router.get('/section', async (req,res) => {
    const { value } = req.query 
    let plants = await plantCollection.find({ 'section': value })     
    res.status(200).json({ plants })
})

router.post('/',async (req, res) => {    
    const { id, name, width, height, numberFruits, temperature, type, date } = req.body.newPlant    
    let plant = await plantCollection.findById(id)     
    plant.name = name 
    plant.width = width
    plant.height = height
    plant.temperature = temperature
    plant.numberFruits = numberFruits
    plant.type = type
    plant.lastUpdate = date
    plant.save()
    res.status(200).json({plant})
})

router.post('/deleteReport', async (req,res) => {
    let { id } = req.body    
    let plant = await plantCollection.findById(id)
    for(let i = 0; i < plant.imagesReport.length; i++){
        blobService.deleteBlobIfExists(containerName, plant.imagesReport[i].uri.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        })
    }
    plant.statusReported = false
    plant.report= {}
    plant.imagesReport= []
    plant.save()
    let plants = plantCollection.find({ statusReported: true })    
    res.status(200).json({ deleted: true, plants })
})

router.post('/report',upload.array('reports', 3),  async (req, res) => { 
    const files = req.files    
    const { user, plantid, description, date } = req.body
    try{
        let plant = await plantCollection.findById(plantid)
        let imagesReport = []
        if(plant.imagesReport){ imagesReport = plant.imagesReport }
        for(let i = 0; i < files.length; i++){
            let blobName = getBlobName(files[i].originalname)
            let stream = getStream(files[i].buffer)
            let streamLength = files[i].buffer.length
            imagesReport.push({ uri: getFileUrl(blobName) })
            blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
                if(err) {
                    res.sendStatus(500)
                    return;
                }
    
            });
        }
        plant.statusReported = true
        plant.report.user = user
        plant.report.description = description
        plant.report.date = date
        plant.imagesReport = imagesReport        
        plant.save()
        res.status(200).json({ reported: true })
    }catch(e){        
        res.status(200).json({ reported: false })
    }
})

module.exports = router 