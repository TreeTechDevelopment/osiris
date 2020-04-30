const express = require('express');

const app = express();

const userRoutes = require('./userRoutes');
const plantRoutes = require('./plantRoutes');
const chatRoutes = require('./chatRoutes');
const sectionRoutes = require('./sectionRoutes');

const tokenValidation = require('../tokenValidation')

app.get('/', (req,res) => { res.sendStatus(200) })
app.use('/user', userRoutes)
app.use('/plant', tokenValidation, plantRoutes) 
app.use('/chat', tokenValidation, chatRoutes)
app.use('/section', tokenValidation, sectionRoutes) 

module.exports = app