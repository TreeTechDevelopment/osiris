const mongoose = require('mongoose');

const plantCollection = require('./models/plantSchema')
const userCollection = require('./models/userSchema')

mongoose.connect(process.env.DB, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true})
    .then(async (db) => {
        console.log('DB connected')
        
    }) 
    .catch((err) => {console.log(err)}) 