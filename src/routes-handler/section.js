const moment = require('moment')

const sectionCollection = require('../db/models/sectionsSchema');
const plantCollection = require('../db/models/plantSchema');
const userCollection = require('../db/models/userSchema');

const { numberToSerialNumber } = require('../helpers');

const getSections = async (req, res) => {
    let sections = await sectionCollection.find()
    res.status(200).json({ sections })
}

const getInfoSection = async (req, res) => {
    let { id } = req.query
    let section = await sectionCollection.findById(id)
    let initialPlant = section.plants.split('-')[0]
    let finalPlant = section.plants.split('-')[1]
    let finalP = ''
    let initialP = ''
    if(parseInt(initialPlant) >= 1){ initialP = `000${parseInt(initialPlant)}` }
    if(parseInt(initialPlant) >= 10){ initialP = `00${parseInt(initialPlant)}` }
    if(parseInt(initialPlant) >= 100){ initialP = `0${parseInt(initialPlant)}` }
    if(parseInt(initialPlant) >= 1000){ initialP = `${parseInt(initialPlant)}` }
    if(parseInt(finalPlant) >= 1){ finalP = `000${parseInt(finalPlant)}` }
    if(parseInt(finalPlant) >= 10){ finalP = `00${parseInt(finalPlant)}` }
    if(parseInt(finalPlant) >= 100){ finalP = `0${parseInt(finalPlant)}` }
    if(parseInt(finalPlant) >= 1000){ finalP = `${parseInt(finalPlant)}` }
    let plants = await plantCollection.find({ 'serialNumber': {$lte: finalP, $gte: initialP} })
    let employees = []
    for(let i = 0; i < section.employees.length; i++){
        let employee = await userCollection.findById(section.employees[i].idEmployee)
        employees.push(employee)
    }
    res.status(200).json({ plants, employees, section })
}

const createSection = async (req,res) => {
    try{
        const { coordinates, sectionName, employees, plants, owner, checkDateFrom } = req.body
        coordinates.forEach((coordinate) => { delete coordinate._id })
        let sections = await sectionCollection.find({})
        for(let i = 0; i < sections.length; i++){
            if((Number(sections[i].plants.split('-')[0]) <= Number(plants.split('-')[0]) && Number(sections[i].plants.split('-')[1]) >= Number(plants.split('-')[0])) ||
            (Number(sections[i].plants.split('-')[0]) <= Number(plants.split('-')[1]) && Number(sections[i].plants.split('-')[1]) >= Number(plants.split('-')[1]))){
                return res.status(400).send('Ya existe algúna sección que tiene asignada alguna de las plantas ingresadas.')
            }
        }
        const plantFrom = numberToSerialNumber(plants.split('-')[0])
        const plantTo = numberToSerialNumber(plants.split('-')[1])
        let date = moment(checkDateFrom, 'DD/MM/YYYY').add(28, 'day').toDate()
        let dateFormated = moment(date).format('DD/MM/YYYY')
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Lerdo&units=metric&appid=${process.env.OPENWEATHERMAP_KEY}`)       
        const temperature = res.data.main.temp
        let newSection = new sectionCollection({
            sectionName,
            coordinates,
            plants: `${plantFrom}-${plantTo}`,
            owner,
            employees,
            checkDateFrom,
            checkDateTo: dateFormated,
            temperature
        })
        for(let j = 0; j < employees.length; j++){
            let employee = await userCollection.findById(employees[j].idEmployee)
            employee.section = sectionName
            employee.plants = employees[j].plants
            employee.missingPlants = employees[j].plants
            employee.save()
        }
        await plantCollection.updateMany({ 'serialNumber': {$gte: plantFrom, $lte: plantTo  }}, { 'section': sectionName })
        newSection.save((err, newSection) => {
            if(err){
                return res.status(400).send('Ya existe algúna sección con el mismo nombre. Este dato tiene que ser único.')
            }
            res.json({ updated: true })
        })
    }catch(e){
        res.sendStatus(500)
    }
}

const updateSection = async (req, res) => { 
    try{
        const { id } = req.params
        const { coordinates, sectionName, employees, plants, owner, checkDateFrom } = req.body
        let sections = await sectionCollection.find({})
        for(let i = 0; i < sections.length; i++){
            if(sections[i]._id != id){
                if((Number(sections[i].plants.split('-')[0]) >= Number(plants.split('-')[0]) && Number(sections[i].plants.split('-')[0]) <= Number(plants.split('-')[1])) ||
                (Number(sections[i].plants.split('-')[0]) >= Number(plants.split('-')[0]) && Number(sections[i].plants.split('-')[1]) <= Number(plants.split('-')[1]))){
                    return res.status(400).send('Ya existe algúna sección que tiene asignada alguna de las plantas ingresadas.')
                }
            }
        }
        let date = moment(checkDateFrom, 'DD/MM/YYYY').add(28, 'day').toDate()
        let dateFormated = moment(date).format('DD/MM/YYYY')
        let section = await sectionCollection.findById(id)
        coordinates.forEach((coordinate) => { delete coordinate._id })
        section.owner = owner
        section.coordinates = coordinates
        section.sectionName = sectionName
        section.employees = employees
        section.plants = `${numberToSerialNumber(plants.split('-')[0])}-${numberToSerialNumber(plants.split('-')[1])}`
        section.checkDateFrom = checkDateFrom
        section.checkDateTo = dateFormated
        section.save()
        for(let j = 0; j < employees.length; j++){
            let employee = await userCollection.findById(employees[j].idEmployee)
            employee.section = sectionName
            employee.plants = employees[j].plants
            employee.missingPlants = employees[j].plants
            employee.save()
        }
        let finalNumber = plants.split('-')[1]
        let initialNumber = plants.split('-')[0]
        let fni = parseInt(finalNumber)
        let ini = parseInt(initialNumber)
        let finalN = '';
        let initialN = '';
        if(fni >= 1){ finalN = `000${fni}` }
        if(fni >= 10){ finalN = `00${fni}` }
        if(fni >= 100){ finalN = `0${fni}` }
        if(fni >= 1000){ finalN = `${fni}` }
        if(ini >= 1){ initialN = `000${ini}` }
        if(ini >= 10){ initialN = `00${ini}` }
        if(ini >= 100){ initialN = `0${ini}` }
        if(ini >= 1000){ initialN = `${ini}` }
        await plantCollection.updateMany({ 'serialNumber': {$lte: finalN, $gte: initialN} }, { section: sectionName })       
        res.json({ updated: true })
    }catch(e){
        res.sendStatus(500)
    }
}

const deleteSection = async (req, res) => {
    try{
        let { id } = req.params
        let section = await sectionCollection.findByIdAndRemove(id)
        let employees = []
        for(let i = 0; i< section.employees.length; i++){
            let employee = await userCollection.findById(section.employees[i].idEmployee)
            employees.push(employee.name)
        }
        res.json({ section, employees})

    }catch(e){
        res.sendStatus(500)   
    }
}

module.exports = {
    getSections,
    getInfoSection,
    updateSection,
    deleteSection,
    createSection
}