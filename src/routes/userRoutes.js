const express = require('express');
const multer = require('multer');

const inMemoryStorage = multer.memoryStorage()
const upload = multer({ storage: inMemoryStorage })

const tokenValidation = require('../tokanValidation');

const router = express.Router()

const {
    getUsers,
    login,
    updateUserwPhoto,
    createUser,
    updatewoPhoto,
    completeTodo,
    createNewTodo,
    deleteUser,
    deleteTodo,
    finisReading,
    createNewTodowMedia,
    getOwners
} = require('../routes-handler/user')

router.get('/', tokenValidation, getUsers)
router.get('/owner', tokenValidation, getOwners)

router.post('/login', login)
router.post('/updatewphoto', tokenValidation, upload.single('photo'), updateUserwPhoto)
router.post('/create', tokenValidation, upload.single('photo'), createUser)
router.post('/update', tokenValidation, updatewoPhoto)
router.post('/newTask', tokenValidation, createNewTodo)
router.post('/newTaskwMedia', tokenValidation, upload.array('todo', 4), createNewTodowMedia)
router.post('/completeTodo', tokenValidation, completeTodo)
router.post('/delete', tokenValidation, deleteUser)
router.post('/deleteTodo', tokenValidation, deleteTodo)
router.post('/finishReading/', tokenValidation, finisReading)

module.exports = router