const mongoose = require('mongoose');

//-----   User Model   -----//
const cursaSchema = new mongoose.Schema({
    idUser:{
        type: Number,
        required: true
    },    
    idMateria:{
        type: Number,
        required: true
    },   
    Estado: {
        type: String,
        required:true
    }
});
const Cursa = mongoose.model('cursa', cursaSchema);

module.exports = Cursa;