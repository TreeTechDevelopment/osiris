const getStream = require('into-stream');
const moment = require('moment')

const {getBlobName, containerName, blobService, getFileUrl} = require('../azure')

const plantCollection = require('../db/models/plantSchema');

const getPlant = async (req, res) => {
    const { id, from, to, plantsUser } = req.query    
    if(id){
        let plantFrom = plantsUser.split('-')[0]
        let plantTo = plantsUser.split('-')[1]
        let plant = await plantCollection.findById(id)
        if(plant){
            if(plantFrom <= plant.serialNumber && plantTo >= plant.serialNumber){
                res.status(200).json({plant, status: true})
            }else{
                res.status(400).send('No tienes permiso para leer este código')
            }
        }else{
            res.status(400).send('Este código no puede ser leído por esta aplicación')
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
}

const getPLantsReported = async (req,res) => {
    let plants = await plantCollection.find({ statusReported: true })    
    res.status(200).json({ plants })
}

const getSpecificPlant = async (req,res) => {
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
        
}

const getPlantBySection = async (req,res) => {
    const { value } = req.query 
    let plants = await plantCollection.find({ 'section': value })     
    res.status(200).json({ plants })
}

const updatePlant = async (req, res) => {    
    const { id, name, width, height, numberFruits, temperature, type, date, plantedDate } = req.body.newPlant    
    let plant = await plantCollection.findById(id)     
    updateDate = moment(date).format('DD MM YYYY')

    plant.name = name 
    plant.width = width
    plant.height = height
    plant.temperature = temperature
    plant.numberFruits = numberFruits
    plant.type = type
    plant.lastUpdate = updateDate.replace(/\s/g, '/')
    plant.plantedDate = plantedDate
    plant.save()
    res.status(200).json({plant})
}

const deleteReport = async (req,res) => {
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
    let plants = await plantCollection.find({ statusReported: true })    
    res.status(200).json({ deleted: true, plants })
}

const reportPlant = async (req, res) => { 
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
        res.sendStatus(500)
    }
}

const updatePlants = async (req, res) => {
    try{
        const { plants } = req.body
        console.log(plants)
        for(let i = 0; i < plants.length; i++){
            const { id, name, width, height, numberFruits, type, date, plantedDate } = plants[i]    
            let plant = await plantCollection.findById(id)     
            updateDate = moment(date).format('DD MM YYYY')
            if(name !== ""){ plant.name = name }
            if(width !== ""){ plant.width = Number(width) }
            if(height !== ""){ plant.height = Number(height) }
            if(numberFruits !== ""){ plant.numberFruits = Number(numberFruits) }
            if(type !== "" ){ plant.type = type }
            if(plantedDate !== ""){ plant.plantedDate = plantedDate }
            plant.lastUpdate = updateDate.replace(/\s/g, '/')
            plant.save()
        }
        res.sendStatus(200)
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
}

module.exports = {
    getPlant,
    getPLantsReported,
    getSpecificPlant,
    getPlantBySection,
    updatePlant,
    deleteReport,
    reportPlant,
    updatePlants
}