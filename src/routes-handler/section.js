const sectionCollection = require('../db/models/sectionsSchema');
const plantCollection = require('../db/models/plantSchema');
const userCollection = require('../db/models/userSchema');

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

const updateSection = async (req, res) => {    
    const { numberSection, coordinates, nameSections, employees, plants, owners } = req.body
    console.log(coordinates)
    console.log(req.body)
    let sectionsCreated = []
    await sectionCollection.deleteMany()
    for(let i = 0; i < numberSection; i++){
        let finalNumber = plants[i].split('-')[1]
        let initialNumber = plants[i].split('-')[0]
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
        await plantCollection.updateMany({ 'serialNumber': {$lte: finalN, $gte: initialN} }, { section: nameSections[i] })
        coordinates[i].forEach((coordinate) => { delete coordinate._id })
        let newSection = new sectionCollection({
            sectionName: nameSections[i],
            coordinates: coordinates[i],
            employees: employees[i],
            plants: plants[i],
            owner: owners[i]
        })
        newSection.save()
        sectionsCreated.push(newSection)
        for(let j = 0; j < employees[i].length; j++){
            let employee = await userCollection.findById(employees[i][j].idEmployee)
            employee.section = nameSections[i]
            employee.save()
        }
    }        
    res.status(200).json({ updated: true, sections: sectionsCreated})
}

module.exports = {
    getSections,
    getInfoSection,
    updateSection
}