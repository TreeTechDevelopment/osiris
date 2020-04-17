
const newTodo = (data, users, io) => {    
    let index = users.findIndex( user => user.userName === data.userName )
    if(index >= 0){ 
        io.to(`${users[index].socketId}`).emit('newTodo')
    }
}

module.exports = {
    newTodo
}