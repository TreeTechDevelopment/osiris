const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const getStream = require('into-stream');

const inMemoryStorage = multer.memoryStorage()
const upload = multer({ storage: inMemoryStorage })

const {getBlobName, containerName, blobService, getFileUrl} = require('../azure')

const tokenValidation = require('../tokanValidation');

const router = express.Router()

const userCollection = require('../db/models/userSchema');
const sectionCollection = require('../db/models/sectionsSchema');

router.get('/', tokenValidation, async (req,res)=> {
    let users = await userCollection.find({ 'rol': 'employee' })    
    res.status(200).json({ users })
})

router.get('/owner', tokenValidation, async (req,res)=> {
    let users = await userCollection.find({ 'rol': 'owner' })    
    res.status(200).json({ users })
})

router.get('/owner&employee', tokenValidation, async (req,res)=> {
    let employees = await userCollection.find({ 'rol': 'employee' })
    let owners = await userCollection.find({ 'rol': 'owner' })    
    res.status(200).json({ employees, owners })
})

router.get('/all', tokenValidation, async (req,res)=> {
    let users = await userCollection.find()
    let sections = await sectionCollection.find()
    res.status(200).json({ users, sections })
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

router.post('/updatewphoto', tokenValidation, upload.single('photo'), async (req, res) => {
    let { file } = req
    let { id, userName, name, address, section } = req.body
    let user = await userCollection.findById(id)
    let blobName = ''
    if(user.photo.split('/')[4]){
        blobService.deleteBlobIfExists(containerName, user.photo.split('/')[4], (err, result) => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        })
        blobName = getBlobName(file.originalname)
        let stream = getStream(file.buffer)
        let streamLength = file.buffer.length
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
            if(err) {
                res.sendStatus(500)
                return;
            }
        });
    }else{
        blobName = getBlobName(file.originalname)
        let stream = getStream(file.buffer)
        let streamLength = file.buffer.length
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
            if(err) {
                res.sendStatus(500)
                return;
            }
    
        });
    }
    user.userName = userName
    user.name = name
    user.photo = getFileUrl(blobName)
    user.address = address
    if(section){ user.section = section }
    user.save()
    res.status(200).json({ user })
})

router.post('/create', tokenValidation, upload.single('photo'),async (req, res) => {

    let { file } = req
    let { userName, name, address, section, plants, password, rol, sections } = req.body

    let blobName = getBlobName(file.originalname)
    let stream = getStream(file.buffer)
    let streamLength = file.buffer.length
    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
        if(err) {
            res.sendStatus(500)
            return;
        }

    });

    let newUser = {
        userName,
        name, 
        address,
        photo: getFileUrl(blobName),
        rol
    }

    if(rol === 'employee'){
        newUser.plants = plants
        newUser.section = section
    }

    if(rol === 'owner'){
        for(let i = 0; i < sections.length; i++){
            let section = await sectionCollection.findOne({ 'sectionName': sections[i] })
            section.owner = userName
            section.save()
        }
    }

    let user = new userCollection(newUser)
    let passwordHashed = user.generateHash(password)
    user.password = passwordHashed
    user.save()
    
    res.status(200).json({ user })
})

router.post('/update', tokenValidation, async (req, res) => {
    let { id, userName, name, address, section } = req.body
    let user = await userCollection.findById(id)
    console.log(user)
    user.userName = userName
    user.name = name
    user.address = address
    if(section){ user.section = section }
    user.save()
    res.status(200).json({ user })
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