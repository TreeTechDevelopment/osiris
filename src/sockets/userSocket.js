const userCollection = require('../db/models/userSchema');

let users = [] 

const socketFunction = (io) => {     

    io.on('connection', (socket) => {

        console.log('user connected', socket.id)

        socket.on('connectionUser', async (data) => {
            let index = users.findIndex( user => user.userName === data.userName )
            if(index >= 0){ users.splice(index, 1, { userName: data.userName, socketId: socket.id }) }
            else{ users.push({ userName: data.userName, socketId: socket.id }) }
            console.log(users)
        })  

        socket.on('disconnect' , () => {
            console.log('disconnected')
            let index = users.findIndex( user => user.socketId === socket.id )
            if(index >= 0){ users.splice(index, 1) }
        })
    })
}

const emitNewTodo = (io, userName, todos) => {
    console.log('=================MESSAGE FROM USER SOCKET===================');
    console.log(users)
    console.log('====================================');
    let index = users.findIndex( user => user.userName === userName )
    if(index >= 0){ 
        io.to(`${users[index].socketId}`).emit('newTodo', todos)
    }
}

module.exports = {
    socketFunction,
    emitNewTodo
}