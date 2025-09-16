const mongoose = require('mongoose');

const cursaSchema = new mongoose.Schema({
    usuario: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },   
    materia: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'materia'
    },  
    estado: {
        type: String,
        required:true
    }
});
const Cursa = mongoose.model('cursa', cursaSchema);

module.exports = Cursa;