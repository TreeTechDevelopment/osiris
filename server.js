if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('./src/db/db');
require('./src/schedules')

const userRoutes = require('./src/routes/userRoutes');
const plantRoutes = require('./src/routes/plantRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const sectionRoutes = require('./src/routes/sectionRoutes');

const tokenValidation = require('./src/tokanValidation')

const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = require('http').createServer(app)

const io = require('socket.io').listen(server); 
require('./src/sockets/socket')(io)

app.get('/', (req,res) => { res.sendStatus(200) })
app.use('/user', userRoutes)
app.use('/plant', tokenValidation, plantRoutes) 
app.use('/chat', tokenValidation, chatRoutes)
app.use('/section', tokenValidation, sectionRoutes) 

server.listen(PORT, () => {
    console.log(`server on port ${PORT}`)
}) 