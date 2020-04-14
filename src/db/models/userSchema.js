const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema;

const userSchema = Schema({
    rol: String,
    userName: String,
    password: String,
    todos: [{
        title: String,
        todo: String,
        status: Boolean        
    }],
    reads: [{
        lat: String,
        lng: String,
        date: String
    }],
    readToday: Boolean,
    section: String,
    name: String,
    plants: String,
    meanReads: Number,
    photo: String,
    address: String
})

userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('Users', userSchema);