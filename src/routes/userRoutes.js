const express = require('express');
const jwt = require('jsonwebtoken');

const tokenValidation = require('../tokanValidation');

const router = express.Router()

const userCollection = require('../db/models/userSchema');

router.post('/login', async (req, res) => {
    const { userName, password } = req.body
    let token = jwt.sign({ userName }, 'OSIRIS-KEY' , { expiresIn: 60 * 60 * 24 });
    token = `OSIRIS-${token}`    
    let user = await userCollection.findOne({"userName": userName}) 
    if(user){
        if(user.validPassword(password)){ 
            if(user.rol === "employee"){
                res.status(200).json({ logged: true, user: {userName, rol: user.rol, todos:user.todos}, token }) 
            }if(user.rol === "manager"){                
                res.status(200).json({ logged: true, user: {userName, rol: user.rol }, token }) 
            }if(user.rol === "admin"){                
                res.status(200).json({ logged: true, user: {userName, rol: user.rol }, token }) 
            }     
        }
        else{ res.status(200).json({ logged: false, user: {} }) }
    }else{
        res.status(200).json({ logged: false, user: {}})
    }
})

router.get('/search', tokenValidation, async (req,res)=> {
    const { section } = req.query
    let users = []
    if(section){
        users = await userCollection.find({ 'rol': 'employee', 'section': section })  
    }else{
        users = await userCollection.find({ 'rol': 'employee' })  
    }    
    res.status(200).json({ users })
})

router.post('/newTask', tokenValidation, async (req,res) => {
    try{
        const {task} = req.body
        const {title, description, plants} = task           
        for(let i = 0; i < plants.length; i++){
            let todo = description + `\nPlantas:`
            let users = await userCollection.find({ 'section': plants[i].section })
            for(let j = 0; j < plants[i].number.length; j++){
                todo += `\n${plants[i].number[j]}`
            }        
            for(let j = 0; j < users.length; j++){
                let todos = users[i].todos
                todos.push({
                    title,
                    todo,
                    status: false
                })
                users[i].todos = todos
                users[i].save()
            }
        }
        res.status(200).json({ done: true })
    }catch(e){
        res.status(200).json({ done: false })
    }
})

router.post('/completeTodo', tokenValidation, async (req,res)=> {
    const {todoId, userName} = req.body 
    console.log(req.body)       
    const user = await userCollection.findOne({ "userName": userName })    
    let {todos} = user
    for(let i = 0; i < todos.length; i++){
        if(todos[i].id === todoId){ 
            todos[i].status = true
        }
    }    
    user.todos = todos
    user.save()
    res.status(200).json({}) 
})

router.post('/deleteTodo', tokenValidation, async (req,res)=> {
    const {todoId, userName} = req.body 
    console.log(req.body)       
    const user = await userCollection.findOne({ "userName": userName })    
    let {todos} = user    
    for(let i = 0; i < todos.length; i++){
        if(todos[i].id === todoId){
            todos.splice(i,1)             
        }
    } 
    user.todos = todos       
    user.save()
    res.status(200).json({user}) 
})

router.post('/finishReading/', tokenValidation, async (req, res) => {
    const {reads, userName} = req.body
    const user = await userCollection.findOne({ "userName": userName })
    let newReads = user.reads    
    let mean = 0
    for(let i = 0; i < reads.length - 1; i++){
        newReads.push(reads[i])
        let time1 = reads[i].date.split(' ')[4]
        let time2 = reads[i + 1].date.split(' ')[4]
        let hour1 = time1.split(':')[0]
        let hour2 = time2.split(':')[0]
        let minute1 = time1.split(':')[1]
        let minute2 = time2.split(':')[1]
        if(hour1 === hour2){
            mean += parseInt(minute2) - parseInt(minute1)
        }else{
            mean += parseInt(minute2) - 60 - parseInt(minute1)
        }
    }
    mean = mean / ( reads.length - 1 )
    user.reads = newReads
    user.meanReads = mean
    user.save() 
    res.status(200).json({})
})

module.exports = router