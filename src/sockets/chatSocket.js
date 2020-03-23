const userCollection = require('../db/models/userSchema');
const manager = userCollection.findOne({ 'rol': 'manager' })

module.exports = (io) => {

    let users = []

    io.on('connection', (socket) => {
        socket.emit('connection', 'connected')
        console.log('user connected', socket.id)

        socket.on('userConnected', (data) => {
            for(let  i = 0; i < users.length; i++){
                if(users[i].userName === data.userName){
                    users[i].socketId = socket.id
                    console.log(users)
                    return
                }
            }
            users.push({
                userName: data.userName,
                socketId: socket.id
            })
            console.log(users)
        })   
        
        socket.on('messageToManager', (data) => {
            
            for(let i = 0; i < users.length; i++ ){
                if(users[i].userName === manager.userName){

                }
            }
        })
    })
}