const jwt = require('jsonwebtoken');
const getStream = require('into-stream');
const moment = require('moment');

const userCollection = require('../db/models/userSchema');
const sectionCollection = require('../db/models/sectionsSchema');
const plantCollection = require('../db/models/plantSchema');
const chatCollection = require('../db/models/chatSchema');

const {getBlobName, containerName, blobService, getFileUrl} = require('../azure')

const { numberToSerialNumber } = require('../helpers');

const getUsers  = async (req,res)=> {
    try{
        const { rol, sections, section, rol2 } = req.query
        let users = []
        if(rol2){
            let owners = await userCollection.find({ 'rol': rol2 }, 'name userName rol')
            let employees = await userCollection.find({ 'rol': rol }, 'name userName rol plants section')
            res.json({ employees, owners })
            return
        }
        if(section){ users = await userCollection.find({ 'rol': rol, 'section': section }, 'section name userName rol todos') }
        else{ users = await userCollection.find({ 'rol': rol }, 'name userName photo address plants section todos rol') }
        if(sections){
            let sections = await sectionCollection.find({})
            res.status(200).json({ users, sections }) 
            return
        }    
        res.json({ users })
    }catch(e){
        res.sendStatus(500)
    }
}

const login = async (req, res) => {
    try{
        const { userName, password } = req.body 
        let user = await userCollection.findOne({"userName": userName})   
        if(user){
            if(user.validPassword(password)){ 
                const payload= {
                    userName,
                    rol: user.rol,
                    _id: user._id
                }
                let token = jwt.sign(payload, process.env.JWT_SEED , { expiresIn: 60 * 60 * 24 });
                token = `${process.env.TOKEN_HEADER} ${token}`
                if(user.rol === "employee"){
                    let section = await sectionCollection.findOne({ 'sectionName': user.section })
                    if(!section){ return res.status(400).send('Este usuario no está asignado a ninguna sección. Un administrador debe .') }
                    let userResponse = {
                        userName, 
                        rol: user.rol, 
                        todos:user.todos, 
                        plants: user.plants, 
                        id: user._id, 
                        missingPlants: user.missingPlants,
                        section: section.coordinates
                    }
                    res.json({ logged: true, user: userResponse, token }) 
                }else if(user.rol === "manager"){                
                    res.json({ logged: true, user: {userName, rol: user.rol, id: user._id }, token }) 
                }else if(user.rol === "admin"){                
                    res.json({ logged: true, user: {userName, rol: user.rol, id: user._id }, token }) 
                }else if(user.rol === "owner"){                
                    res.json({ logged: true, user: {userName, rol: user.rol, id: user._id }, token }) 
                }
            }
            else{ res.status(200).json({ logged: false, user: {} }) }
        }else{
            res.json({ logged: false, user: {}})
        }
    }catch(e){
        res.sendStatus(500)
    }
    
}

const updateUserwPhoto = async (req, res) => {
    try{
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
        if(user.rol === "employee"){
            let chat = await chatCollection.findOne({ 'from': user.userName })
            if(chat){
                chat.from = userName
                chat.save()
            }
        }else if(user.rol === "manager"){
            let chats = await chatCollection.find({ 'to': user.userName })
            for(let i = 0; i < chats.length; i++){
                chats[i].to = userName
                chats[i].save()
            }
        }
        user.userName = userName
        user.name = name
        user.photo = getFileUrl(blobName)
        user.address = address
        if(section){ user.section = section }
        if(plants){ user.plants = plants }
        user.save((err, newUser) => {
            if(err){
                return res.status(400).send('Ya existe algún empleado con el mismo usuario. Este dato tiene que ser único.')
            }
            
            
            delete newUser.password
            res.status(200).json({ user: newUser })
        })
    }catch(e){
        console.log('COn foto')
        console.log(e)
        res.sendStatus(500)
    }
}

const createUser = async (req, res) => {

    try{
        let { file } = req
        let { userName, name, address, section, plants, password, rol } = req.body

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
            rol,
            photo: getFileUrl(blobName)
        }

        if(rol === 'employee'){
            let plantFrom = numberToSerialNumber(plants.split('-')[0])
            let plantTo = numberToSerialNumber(plants.split('-')[1])
            newUser.plants = `${plantFrom}-${plantTo}`
            newUser.missingPlants = `${plantFrom}-${plantTo}`
            newUser.section = section
        }

        let user = new userCollection(newUser)

        let passwordHashed = user.generateHash(password)
        user.password = passwordHashed

        user.save((err, newUser) => {
            if(err){
                blobService.deleteBlobIfExists(containerName, blobName, (err, result) => {
                    if(err) {
                        res.sendStatus(500)
                        return; 
                    }
                })
                return res.status(400).send('Ya existe algún empleado con el mismo usuario. Este dato tiene que ser único.')
            }
            
            
            delete newUser.password
            res.status(200).json({ user: newUser })
        })

    }catch(e){
        res.sendStatus(500)
    }

}

const updatewoPhoto = async (req, res) => {
    try{
        let { id, userName, name, address, section, plants } = req.body
        let user = await userCollection.findById(id)
        if(user.rol === "employee"){
            let chat = await chatCollection.findOne({ 'from': user.userName })
            if(chat){
                chat.from = userName
                chat.save()
            }
        }else if(user.rol === "manager"){
            let chats = await chatCollection.find({ 'to': user.userName })
            for(let i = 0; i < chats.length; i++){
                chats[i].to = userName
                chats[i].save()
            }
        }
        user.userName = userName
        user.name = name
        user.address = address
        if(section){ user.section = section }
        if(plants){ user.plants = plants }
        user.save((err, newUser) => {
            if(err){
                return res.status(400).send('Ya existe algún empleado con el mismo usuario. Este dato tiene que ser único.')
            }
            
            
            delete newUser.password
            res.status(200).json({ user: newUser })
        })
    }catch(e){
        console.log('Sin foto')
        console.log(e)
        res.sendStatus(500)
    }
}

const createNewTodo = async (req,res) => {
    try{
        const {task} = req.body
        const {title, description, plants, plantsAlreadyOrdenated, userName } = task 
        if(plantsAlreadyOrdenated){
            let user = await userCollection.findOne({ 'userName': userName })
            let todos = user.todos
            let todo = description + `\nPlantas: ${plantsAlreadyOrdenated}`
            todos.push({
                title,
                todo,
                status: false
            })
            user.save()
            res.status(200).json({ done: true, user })
        }else{
            for(let i = 0; i < plants.length; i++){
                let todo = description + `\nPlantas:`
                let users = await userCollection.find({ 'section': plants[i].section })
                for(let j = 0; j < plants[i].number.length; j++){
                    todo += `\n${plants[i].number[j]}`
                }        
                for(let j = 0; j < users.length; j++){
                    let todos = users[j].todos
                    todos.push({
                        title,
                        todo,
                        status: false
                    })
                    users[j].todos = todos
                    users[j].save()
                }
            }
            res.status(200).json({ done: true })
        }
    }catch(e){
        res.sendStatus(500)
    }
}

const createNewTodowMedia = async (req,res) => {
    const files = req.files
    let media = []
    for(let i = 0; i < files.length; i++){
        let blobName = getBlobName(files[i].originalname)
        let stream = getStream(files[i].buffer)
        let streamLength = files[i].buffer.length
        media.push({ uri: getFileUrl(blobName) })
        blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
            if(err) {
                res.sendStatus(500)
                return;
            }

        }); 
    }
    try{
        const {title, description, plants, plantsAlreadyOrdenated, userName } = req.body
        if(plantsAlreadyOrdenated){
            let user = await userCollection.findOne({ 'userName': userName })
            let todos = user.todos
            let todo = description + `\nPlantas: ${plantsAlreadyOrdenated}`
            todos.push({
                title,
                todo,
                status: false,
                imgs: media
            })
            user.todos = todos
            user.save()            
            res.status(200).json({ done: true, user })
        }else{
            for(let i = 0; i < plants.length; i++){
                let todo = description + `\nPlantas:`
                let users = await userCollection.find({ 'section': plants[i].section })
                for(let j = 0; j < plants[i].number.length; j++){
                    todo += `\n${plants[i].number[j]}`
                }        
                for(let j = 0; j < users.length; j++){
                    let todos = users[j].todos
                    todos.push({
                        title,
                        todo,
                        status: false,
                        imgs: media
                    })
                    users[j].todos = todos
                    users[j].save()
                }
            }
            res.status(200).json({ done: true })
        }
    }catch(e){
        res.status(200).json({ done: false })
    }
}

const completeTodo = async (req,res)=> {
    try{
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
        res.json({todos: user.todos})
    }catch(e){
        res.sendStatus(500)
    }
}

const deleteUser = async (req,res)=> {
    try{
        const { id } = req.body       
        let user = await userCollection.findById(id)   
        if(user.photo) {
            blobService.deleteBlobIfExists(containerName, user.photo.split('/')[4], (err, result) => {
                if(err) {
                    res.sendStatus(500)
                    return; 
                }
            })
        }
        let section = await sectionCollection.findOne({ 'sectionName': user.section })
        if(section && user.rol === "employee"){
            let indexEmployeeInSection = section.employees.findIndex( employee => employee.idEmployee = id )
            section.employees.splice(indexEmployeeInSection, 1)
            section.save()
        }
        await userCollection.findByIdAndRemove(id)
        res.sendStatus(200)
    }catch(e){
        res.sendStatus(500)
    }
}

const deleteTodo = async (req,res)=> {
    try{
        const {todoId, userName} = req.body       
        const user = await userCollection.findOne({ "userName": userName })    
        let {todos} = user
        let index = todos.findIndex( todo => todo._id === todoId )
        todos.splice(index,1)
        user.todos = todos       
        user.save()
        delete user.password
        res.status(200).json({user}) 
    }catch(e){
        res.sendStatus(500)
    }
    
}

const finisReading = async (req, res) => {
    try{
        const {reads, userName, dateStarted, dateFinished} = req.body
        let user = await userCollection.findOne({ "userName": userName })
        let mean = (dateFinished - dateStarted) / reads.length
        mean = mean / 60000
        user.reads = reads
        user.meanReads = Number(mean.toFixed(2))
        user.save() 
        res.status(200).json({})
    }catch(e){
        res.sendStatus(500)
    }
}

const getTemperature = async (req, res) => {
    try{
        let user = await userCollection.findById(req.query.userId)
        let section = await sectionCollection.findOne({ 'sectionName': user.section })
        res.json({ temperature: section.temperature })
    }catch(e){ res.sendStatus(500) }
}

module.exports = {
    getUsers,
    login,
    updateUserwPhoto,
    createUser,
    updatewoPhoto,
    createNewTodo,
    completeTodo,
    deleteUser,
    deleteTodo,
    finisReading,
    createNewTodowMedia,
    getTemperature
}