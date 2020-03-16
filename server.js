const express = require('express');
const bodyParser = require('body-parser');
const app = express();

require('./src/db/db');
const userRoutes = require('./src/routes/userRoutes');
const plantRoutes = require('./src/routes/plantRoutes');

const PORT = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/user', userRoutes)
app.use('/plant', plantRoutes) 


app.listen(PORT, () => {
    console.log(`server on port ${PORT}`)
})   