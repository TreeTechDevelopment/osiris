const CronJob = require('cron').CronJob;
const axios = require('axios').default;

const sectionCollection = require('./db/models/sectionsSchema')
const userCollection = require('./db/models/userSchema')
const plantCollection = require('./db/models/plantSchema')
const chatCollection = require('./db/models/chatSchema')

const { checkDate, missingPlantsFormatted } = require('./helpers');

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

const jobCheckEmployeeDone = new CronJob('0 0 3 * * *', async () => {
    try{
        const employees = await userCollection.find({ 'rol': 'employee' })
        for(let i = 0; i < employees.length; i++){

            let plantFrom = employees[i].plants.split('-')[0]
            let plantTo = employees[i].plants.split('-')[1]

            let section = await sectionCollection.findOne({ 'sectionName': employees[i].section })
            let dateCheckFrom = section.dateCheckFrom
            let dateCheckTo = section.dateCheckTo

            let plants = await plantCollection.find({ 'serialNumber': { $gte: plantFrom, $lte: plantTo } })

            let missingPlants = []

            for(let j = 0; j < plants.length; j++){
                if(!checkDate(plants[i].lastUpdate, dateCheckFrom, dateCheckTo)){
                    missingPlants.push(plants[i].serialNumber)
                }
            }
            
            employees[i].missingPlants = missingPlantsFormatted(missingPlants)
            employees[i].save()
        }
    }catch(e){ console.log(e) }
});

const jobCheckChat = new CronJob('0 0 3 */1 * *', async () => {
    await chatCollection.updateMany({}, { '$pull': { 'chat':  { 'days': 3 } } })
    await chatCollection.updateMany({}, { '$inc': {'chat.$[].days': 1}  })
});

//const jobKeepAwake = new CronJob('0 */20 * * * *', () => {
  //  axios.get(`https://kaffeeqrapp.herokuapp.com`)
    //    .then((res) => {
      //  }).catch((e) => console.log(e))
//});

//jobKeepAwake.start()
jobCheckEmployeeDone.start()
jobCheckChat.start()
jobGetWeather.start()