const express = require('express');

const router = express.Router()

const userCollection = require('../db/schemas/userSchema');

router.get('/', async (req, res) => {
    const { userName, password } = req.query
    let user = await userCollection.findOne({"userName": userName}) 
    if(user){
        if(user.validPassword(password)){ 
            if(user.rol === "employee"){
                res.status(200).json({ logged: true, user: {userName, rol: user.rol, todos:user.todos} }) 
            }else{
                res.status(200).json({ logged: true, user: {userName, rol: user.rol} }) 
            }            
        }
        else{ res.status(200).json({ logged: false, user: {} }) }
    }else{
        res.status(200).json({ logged: false, user: {}})
    }
})

router.post('/todo/', async (req,res)=> {
    const {todoId, userName} = req.body    
    const user = await userCollection.findOne({ "userName": userName })    
    let {todos} = user
    for(let i = 0; i < todos.length; i++){
        if(todos[i].id === todoId){ 
            console.log(todos.splice(i,1))
        }
    }
    res.status(200).json({})
})

module.exports = router