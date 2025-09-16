const mongoose = require('mongoose');

const previaSchema = new mongoose.Schema({
    materiaBase: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'materia'
    },   
    materiaPrevia: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'materia'
    },  
    requisito: {
        type: String,
        required:true
    }
});
const Previa = mongoose.model('previa', previaSchema);

module.exports = Previa;