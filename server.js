const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('./src/db/db');
const userRoutes = require('./src/routes/userRoutes');
const plantRoutes = require('./src/routes/plantRoutes');

const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server = require('http').createServer(app)

const io = require('socket.io').listen(server); 
require('./src/sockets/chatSocket')(io)

app.use('/user', userRoutes)
app.use('/plant', plantRoutes) 

server.listen(PORT, () => {
    console.log(`server on port ${PORT}`)
})   