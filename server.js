const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const server = require('http').createServer(app);

require('./src/db/db');
const userRoutes = require('./src/routes/userRoutes');
const plantRoutes = require('./src/routes/plantRoutes');

const PORT = 3000 || process.env.PORT

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/user', userRoutes)
app.use('/plant', plantRoutes)


server.listen(PORT, () => {
    console.log(`server on port ${PORT}`)
})   