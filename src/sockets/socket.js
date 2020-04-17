
const { getChat, messageToManager, messageFromManager } = require('./chatSocket')
const { newTodo } = require('./userSocket')

module.exports = (io) => {

    let users = []      

    io.on('connection', (socket) => {   

        console.log('user connected', socket.id)  

        socket.emit('userConnected', (data) => {
            let index = users.findIndex( user => user.userName === data.userName )

            if(index >= 0){
                users[index] = {
                    userName: data.userName,
                    socketId: socket.id 
                }
            }else{
                users.push({
                    userName: data.userName,
                    socketId: socket.id  
                })
            }

            console.log(users)
        })
        
        socket.on('userConnectedToChat', getChat)

        socket.on('messageFromManager', async (data) => { messageFromManager(data, users, io) })         
        
        socket.on('messageToManager', async (data) => { messageToManager(data, users, io) })

        socket.on('newTodo', async (data) => { newTodo(data, users, io) })

        socket.on('disconnect' , () => {
            console.log('disconnected')

            let index = users.findIndex( user => user.socketId === socket.id )
            users.splice(index,1)
            
        })
    })
}