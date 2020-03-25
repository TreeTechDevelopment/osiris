const express = require('express');

const router = express.Router()

const userCollection = require('../db/models/userSchema');

router.get('/', async (req, res) => {
    const { userName, password } = req.query
    let user = await userCollection.findOne({"userName": userName}) 
    if(user){
        if(user.validPassword(password)){ 
            if(user.rol === "employee"){
                res.status(200).json({ logged: true, user: {userName, rol: user.rol, todos:user.todos} }) 
            }if(user.rol === "manager"){                
                res.status(200).json({ logged: true, user: {userName, rol: user.rol } }) 
            }      
        }
        else{ res.status(200).json({ logged: false, user: {} }) }
    }else{
        res.status(200).json({ logged: false, user: {}})
    }
})

router.get('/search', async (req,res)=> {
    const { section } = req.query
    let user = await userCollection.find({"section": section})
    res.status(200).json({ user })
})

router.post('/deleteTodo/', async (req,res)=> {
    const {todoId, userName} = req.body        
    const user = await userCollection.findOne({ "userName": userName })    
    let {todos} = user
    for(let i = 0; i < todos.length; i++){
        if(todos[i].id === todoId){ 
            todos[i].status = true
        }
    }    
    user.todos = todos
    user.save()
    res.status(200).json({todos}) 
})

router.post('/finishReading/', async (req, res) => {
    const {reads, userName} = req.body
    const user = await userCollection.findOne({ "userName": userName }) 
    user.reads = reads
    user.save() 
    res.status(200).json({})
})

module.exports = router