const express = require('express');

const router = express.Router()

const {
    getSections,
    getInfoSection,
    updateSection
} = require('../routes-handler/section')

router.get('/', getSections)
router.get('/info', getInfoSection)

router.post('/update', updateSection)

module.exports = router