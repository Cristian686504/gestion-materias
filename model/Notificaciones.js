const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    usuario: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },   
    tipo: {
        type: String,
        required: true
    },
    mensaje: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        default: {}
    },
    leido: {
        type: Boolean,
        default: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('notificacion', notificacionSchema);