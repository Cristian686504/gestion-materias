const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Previa = require("./Previa");

const materiaSchema = new mongoose.Schema({
    codigo: {
        type: Number,
        unique: true
    },    
    nombre: {
        type: String,
        required: true
    },   
    creditos: {
        type: Number,
        required: true
    },
    semestre: {
        type: String,
        required: true
    },
    horarios: [{
        dia: String,
        horaInicio: String,
        horaFin: String
    }]
});

// Activamos el autoincremento sobre "codigo"
materiaSchema.plugin(AutoIncrement, { inc_field: 'codigo' });
// Reiniciar el contador a 1: await mongoose.connection.collection('counters').deleteOne({ _id: 'materia_codigo' });

// Middleware para eliminar cursa asociados al usuario
materiaSchema.pre("findOneAndDelete", async function (next) {
  const materiaId = this.getQuery()["_id"];
  await Previa.deleteMany({
    $or: [
      { materiaBase: materiaId },
      { materiaPrevia: materiaId }
    ]
  });
  next();
});

const Materia = mongoose.model('materia', materiaSchema);

module.exports = Materia;
