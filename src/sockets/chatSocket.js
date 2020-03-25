const userCollection = require('../db/models/userSchema');
const chatCollection = require('../db/models/chatSchema');

module.exports = (io) => {

    let users = []      

    io.on('connection', (socket) => {

        console.log('user connected', socket.id)
        socket.emit('connection', 'connected')

        socket.on('userConnected', async (data, callback) => {            
            for(let  i = 0; i < users.length; i++){
                if(users[i].userName === data.userName){
                    users[i].socketId = socket.id
                    let chat = await chatCollection.findOne({ 'from': data.userName})                    
                    callback(chat)                    
                    return
                }
            }
            users.push({
                userName: data.userName,
                socketId: socket.id
            })
            let chat = await chatCollection.findOne({ 'from': data.userName})            
            callback(chat)            
        })   
        
        socket.on('messageToManager', async (data) => { 
            let chat = await chatCollection.findOne({ 'from': data.userName})    
            const manager = await userCollection.findOne({ 'rol': 'manager' })         
            let managerId = null
            let employeeId = null            
        
            for(let i = 0; i < users.length; i++ ){
                if(users[i].userName === manager.userName){
                    managersId = users[i].socketId
                }
                if(users[i].userName === data.userName){
                    employeeId = users[i].socketId
                }
            }                        
            if(managerId){
                io.to(`${managerId}`).emit('newMessage', data)
                io.to(`${employeeId}`).emit('newMessage', data)                
                if(chat){                    
                    let chatCreated = chat.chat
                    chatCreated.push({ 
                        date: data.date,
                        message: data.message,
                        userName: data.userName                       
                    })   
                    chat.chat =  chatCreated
                    chat.save()                   
                }else{
                    let newChta = new chatCollection({
                        from: data.userName,
                        to: manager.userName,
                        chat: [{ 
                            date: data.date,
                            message: data.message,
                            userName: data.userName                       
                        }]
                    })                    
                    newChta.save()
                }
            }else{
                io.to(`${employeeId}`).emit('newMessage', data)                
                if(chat){
                    let chatCreated = chat.chat
                    chatCreated.push({ 
                        date: data.date,
                        message: data.message,
                        userName: data.userName                       
                    })   
                    chat.chat =  chatCreated
                    chat.save()                
                }else{
                    let newChat = new chatCollection({
                        from: data.userName,
                        to: manager.userName,
                        chat: [{ 
                            date: data.date,
                            message: data.message,
                            userName: data.userName                       
                        }]
                    })
                    newChat.save()
                }
            }
        })
    })
}