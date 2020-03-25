const express = require('express');
const multer = require('multer');

const router = express.Router()
const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, './imageReports')
    },
    filename(req, file, callback) {
        callback(null, `${file.originalname}`)
    },
})
const upload = multer({ storage: Storage});

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

router.get('/section', async (req,res) => {
    const { value } = req.query 
    let plants = await plantCollection.find({ 'section': value })     
    res.status(200).json({ plants })
})

router.post('/',async (req, res) => {    
    const { id, name, width, height, numberFruits, temperature } = req.body.newPlant    
    let plant = await plantCollection.findById(id)     
    plant.name = name 
    plant.width = width
    plant.height = height
    plant.temperature = temperature
    plant.numberFruits = numberFruits
    plant.save()
    res.status(200).json({plant})
})

router.post('/report/',upload.array('reports', 3),  async (req, res) => { 
    const files = req.files
    const { user, plantid, description, date } = req.body
    try{
        let plant = await plantCollection.findById(plantid)
        let newImageReport = []
        for(let i = 0; i < files.length; i++){
            let { filename } = files[i]
            newImageReport.push({ fileName: filename })
        }
        plant.statusReported = true
        plant.report.user = user
        plant.report.description = description
        plant.report.date = date
        plant.imageReport = newImageReport
        plant.save()     
        res.status(200).json({ reported: true })
    }catch(e){
        console.log(e)
        res.status(200).json({ reported: false })
    }
})

module.exports = router