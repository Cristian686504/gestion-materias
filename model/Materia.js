const mongoose = require('mongoose');
const Materia = require('./Materia');

const materiaSchema = new mongoose.Schema({
    codigo:{
        type: Number,
        required: true
    },    
    nombre:{
        type: String,
        required: true
    },   
    creditos: {
        type: Number,
        required:true
    },
    semestre: {
        type: String,
        required:true
    },
    horarios:{
        type: String,
        required:true
        },
    previas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'materia',
        required: false
    }]
});
const Materia = mongoose.model('materia', materiaSchema);

module.exports = Materia;