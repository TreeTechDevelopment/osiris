const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const moment = require('moment')

const sectionCollection = require('./db/models/sectionsSchema')
const userCollection = require('./db/models/userSchema')
const plantCollection = require('./db/models/plantSchema')
const chatCollection = require('./db/models/chatSchema')

const { checkDate, missingPlantsFormatted, numberToSerialNumber } = require('./helpers');

const jobGetWeather = new CronJob('0 */30 * * * *', () => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Lerdo&units=metric&appid=${process.env.OPENWEATHERMAP_KEY}`)
        .then((res) => {
            const temperature = res.data.main.temp
            sectionCollection.updateMany({}, { temperature }, (err, res) => {
                if(err){
                    console.log(err)
                }
            })
        }).catch((e) => console.log(e))
});

const jobCheckEmployeeDone = new CronJob('0 0 3 */1 * *', async () => {
    try{
        const employees = await userCollection.find({ 'rol': 'employee' })
        for(let i = 0; i < employees.length; i++){

            let plantFrom = numberToSerialNumber(employees[i].plants.split('-')[0])
            let plantTo = numberToSerialNumber(employees[i].plants.split('-')[1])

            let section = await sectionCollection.findOne({ 'sectionName': employees[i].section })
            let dateCheckFrom = section.checkDateFrom
            let dateCheckTo = section.checkDateTo

            let plants = await plantCollection.find({ 'serialNumber': { $gte: plantFrom, $lte: plantTo } })

            let missingPlants = []

            for(let j = 0; j < plants.length; j++){
                if(plants[j].lastUpdate){
                    if(!checkDate(plants[j].lastUpdate, dateCheckFrom, dateCheckTo)){
                        missingPlants.push(plants[j].serialNumber)
                    }
                }else{
                    missingPlants.push(plants[j].serialNumber)
                }
            }

            if(missingPlants.length === 0){ 
                section.finishRead = true
                section.save()
            }
            
            employees[i].missingPlants = missingPlantsFormatted(missingPlants)
            employees[i].save()
        }
    }catch(e){ console.log(e) }
});

const jobCheckChat = new CronJob('0 10 3 */1 * *', async () => {
    await chatCollection.updateMany({}, { '$pull': { 'chat':  { 'days': 3 } } })
    await chatCollection.updateMany({}, { '$inc': {'chat.$[].days': 1}  })
});

const jobCheckDate = new CronJob('0 20 3 */1 * *', async () => {
    const sections = await sectionCollection.find({})
    for(let i = 0; i < section.length; i++){
        const newDateFrom = moment(moment(sections[i].dateCheckTo, 'DD/MM/YYYY').add(1, 'day').toDate()).format('DD/MM/YYYY')
        if(!checkDate(moment(moment().toDate()).format('DD/MM/YYYY'), sections[i].dateCheckFrom, newDateFrom)){            
            let date = moment(newDateFrom, 'DD/MM/YYYY').add(28, 'day').toDate()
            let dateFormated = moment(date).format('DD/MM/YYYY')

            let plantFrom = numberToSerialNumber(sections[i].plants.split('-')[0])
            let plantTo = numberToSerialNumber(sections[i].plants.split('-')[1])

            let plants = await plantCollection.find({ 'serialNumber': { $gte: plantFrom, $lte: plantTo } })

            let averageWidth = 0
            let averageHeight = 0
            let averageNumberFruits = 0
            let averageSP = 0
            let averageCP = 0

            for(let j = 0; j < plants.length; j++){
                averageWidth += plants[j].width
                averageHeight += plants[j].height
                averageNumberFruits += plants[j].numberFruits
                if(plants[j].statusReported){ averageCP++ }
                else{ averageSP++ }
            }

            sections[i].lastPeriod.width = averageWidth / plants.length
            sections[i].lastPeriod.height = averageHeight / plants.length
            sections[i].lastPeriod.numberFruits = averageNumberFruits / plants.length
            sections[i].lastPeriod.withoutPlague = averageSP 
            sections[i].lastPeriod.withPlague = averageCP
            sections[i].dateCheckFrom = newDateFrom
            sections[i].dateCheckTo = dateFormated
            sections[i].save()
            
        }
    }
});

//const jobKeepAwake = new CronJob('0 */20 * * * *', () => {
  //  axios.get(`https://kaffeeqrapp.herokuapp.com`)
    //    .then((res) => {
      //  }).catch((e) => console.log(e))
//});

//jobKeepAwake.start()
jobCheckEmployeeDone.start()
jobCheckDate.start()
jobCheckChat.start()
jobGetWeather.start()