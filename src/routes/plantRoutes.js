const express = require('express');
const multer = require('multer');

const router = express.Router()
const inMemoryStorage = multer.memoryStorage()
const upload = multer({ storage: inMemoryStorage })

const {
    getPlant,
    getPLantsReported,
    getSpecificPlant,
    getPlantBySection,
    updatePlant,
    deleteReport,
    reportPlant
} = require('../routes-handler/plant');

router.get('/', getPlant)
router.get('/reports', getPLantsReported) 
router.get('/specific', getSpecificPlant)
router.get('/section', getPlantBySection)

router.post('/', updatePlant)
router.post('/deleteReport', deleteReport)
router.post('/report',upload.array('reports', 3), reportPlant )

module.exports = router 