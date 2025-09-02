const mongoose = require('mongoose');

//-----   User Model   -----//
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },    
    email:{
        type: String,
        required: true
    },   
    password: {
        type: String,
        required:true
    },
    rol: {
        type: String,
        required:true
    }
});
const User = mongoose.model('user', userSchema);

module.exports = User;