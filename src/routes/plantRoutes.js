const express = require('express');

const router = express.Router()

const plantCollection = require('../db/schemas/plantSchema');

router.get('/', async (req, res) => {
    const { id } = req.query    
    let plant = await plantCollection.findById(id)    
    res.status(200).json({plant})
})

router.post('/', async (req, res) => {    
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

module.exports = router