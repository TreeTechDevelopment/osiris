
const userCollection = require('../db/models/userSchema')

const newTodo = (data, users, io) => {    
    let index = users.findIndex( user => user.userName === data.userName )
    if(index >= 0){ 
        io.to(`${users[index].socketId}`).emit('newTodo')
    }
}

const alertPosition = async (data, users, io) => {
    let admin = await userCollection.findOne({ 'rol': 'admin' })
    let index = users.findIndex( user => user.userName === admin.userName )
    if(index >= 0){ 
        io.to(`${users[index].socketId}`).emit('alertPosition' , { user: data.userName })
    }
}

module.exports = {
    newTodo,
    alertPosition
}