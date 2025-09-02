const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    IdUsuario:{
        type: Int,
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
    previas:{
        type: String,
        required:false
        },
    estado:{
        type: String,
        required:false
    }
});
const Historial = mongoose.model('historial', historialSchema);

module.exports = Historial;