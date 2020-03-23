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
    const { id } = req.query    
    let plant = await plantCollection.findById(id)
    if(plant){
        res.status(200).json({plant, status: true})
    }else{
        res.status(200).json({plant, status: false}) 
    }
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