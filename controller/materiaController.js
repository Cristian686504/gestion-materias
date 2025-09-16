const Materia = require("../model/Materia");
const Previa = require("../model/Previa");
const User = require("../model/User");
const Cursa = require("../model/Cursa");
const Notificacion = require("../model/Notificaciones");

const getAllMaterias = async function (page = null, limit = null) {
  try {

    // Si no se pasan parámetros, devolver todos los registros sin paginación
    if (!page || !limit) {
      const materias = await Materia.find().sort({ nombre: 1 });

      return {
        materias,
        totalMaterias: materias.length,
        paginated: false
      };
    }

    // Si se pasan parámetros, aplicar paginación
    const skip = (page - 1) * limit;
    const materias = await Materia.find()
      .skip(skip)
      .limit(limit)
      .sort({ nombre: 1 });

    const totalMaterias = await Materia.countDocuments();
    const totalPages = Math.ceil(totalMaterias / limit);

    return {
      materias,
      currentPage: page,
      totalPages,
      totalMaterias,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      paginated: true
    };
  } catch (err) {
    console.error("Error al obtener materias:", err);
    throw err;
  }
};

const crearMateria = async function (req, res) {
  try {
    // Extraemos los campos que necesitamos del body
    const { nombre, creditos, semestre, horarios } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!nombre || !creditos || !semestre || !horarios) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son requeridos (nombre, creditos, semestre, horarios)"
      });
    }

    // Crear la nueva materia con los datos correctos
    const nuevaMateria = new Materia({
      codigo: null, // El código se autoincrementa
      nombre,
      creditos,
      semestre,
      horarios
    });

    // Guardar en la base de datos
    await nuevaMateria.save();

    // Obtener estudiantes y crear notificaciones
    const estudiantes = await User.find({ rol: 'Estudiante' });
    const notificacionesPromises = estudiantes.map(estudiante => {
      return new Notificacion({
        usuario: estudiante._id,
        tipo: 'nueva_materia',
        mensaje: `Nueva materia disponible: ${nombre}`,
        data: {
          materiaId: nuevaMateria._id,
          materiaNombre: nombre,
          semestre: semestre,
          creditos: creditos
        },
        fechaCreacion: new Date() // Usar fechaCreacion consistentemente
      }).save();
    });
    
    await Promise.all(notificacionesPromises);

    // Enviar notificación en tiempo real
    if (global.sendNotificationToStudents) {
      await global.sendNotificationToStudents({
        tipo: 'nueva_materia',
        mensaje: `Nueva materia disponible: ${nombre}`,
        data: {
          materiaId: nuevaMateria._id,
          materiaNombre: nombre,
          semestre: semestre,
          creditos: creditos
        },
        fechaCreacion: new Date()
      });
    }

    // Responder con éxito
    res.status(201).json({
      success: true,
      message: "Materia creada exitosamente",
      materia: {
        id: nuevaMateria._id,
        nombre: nuevaMateria.nombre,
        codigo: nuevaMateria.codigo
      }
    });

  } catch (err) {
    console.error('Error en crearMateria:', err);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: errors
      });
    }

    // Error genérico
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

const getMateriaById = async function (req, res) {
  try {
    const { id } = req.params;

    const materia = await Materia.findById(id);

    if (!materia) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Aquí devolvemos la materia al frontend
    res.json(materia);
  } catch (err) {
    console.error("Error al obtener materia:", err);
    res.status(500).json({ message: "Error del servidor" });
  }
};

const editarMateria = async function (req, res) {
  try {
    // Extraemos los campos que necesitamos del body
    const { id, nombre, creditos, semestre, horarios } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!id || !nombre || !creditos || !semestre || !horarios) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son requeridos (id, nombre, creditos, semestre, horarios)"
      });
    }

    const materiaActualizada = await Materia.findByIdAndUpdate(
      id,
      { nombre, creditos, semestre, horarios },
      { new: true, runValidators: true }
    );

    if (!materiaActualizada) {
      return res.status(404).json({
        success: false,
        error: "Materia no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Materia editada exitosamente",
      data: materiaActualizada
    });

  } catch (err) {
    console.error('Error en editarMateria:', err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        error: `Ya existe una materia con este ${field}`
      });
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: "Error de validación",
        details: errors
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

const eliminarMateria = async function (req, res) {
  try {
    const { id } = req.params;

    const materia = await Materia.findById(id);
    if (!materia) {
      return res.status(404).json({
        success: false,
        error: "Materia no encontrada"
      });
    }
    await Materia.findByIdAndDelete(materia.id);
    res.status(200).json({
      success: true,
      message: "Materia eliminada exitosamente"
    });
  }
  catch (err) {
    console.error('Error en eliminarMateria:', err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

const buscarMaterias = async function (req, res) {
  try {
    const { search } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!search || typeof search !== 'string') {
      return res.status(400).json({ error: 'Parámetro de búsqueda inválido' });
    }

    const searchQuery = {
      $or: [
        { nombre: { $regex: search, $options: 'i' } },
        { semestre: { $regex: search, $options: 'i' } },
        { 'horarios.dia': { $regex: search, $options: 'i' } },
        { 'horarios.horaInicio': { $regex: search, $options: 'i' } },
        { 'horarios.horaFin': { $regex: search, $options: 'i' } }
      ]
    };

    if (!isNaN(search)) {
      searchQuery.$or.push({ creditos: Number(search) });
    }

    const materias = await Materia.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ nombre: 1 });
    const totalMaterias = await Materia.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalMaterias / limit);

    res.json({
      materias,
      currentPage: page,
      totalPages,
      totalMaterias,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (err) {
    console.error('Error en buscar materias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

const getPreviasById = async function (req, res) {
  try {
    const { id } = req.params;

    const materia = await Materia.findById(id);
    if (!materia) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }

    const previas = await Previa.find({ materiaBase: materia._id })
      .populate("materiaPrevia", "nombre codigo semestre")
      .populate("materiaBase", "nombre codigo semestre");

    const previasAdaptadas = previas.map(p => ({
      materiaId: p.materiaPrevia._id,
      nombre: p.materiaPrevia.nombre,
      semestre: p.materiaPrevia.semestre,
      requisito: p.requisito.toLowerCase()
    }));

    res.json({
      success: true,
      previas: previasAdaptadas
    });

  } catch (err) {
    console.error("Error al obtener previas:", err);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

const agregarPrevia = async function (req, res) {
  try {
    const { materiaId, materiaPreviaId, requisito } = req.body;

    // Validaciones
    if (!materiaId || !materiaPreviaId || !requisito) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos son requeridos (materiaId, materiaPreviaId, requisito)"
      });
    }

    // Verificar que las materias existan
    const materia = await Materia.findById(materiaId);
    const materiaPrevia = await Materia.findById(materiaPreviaId);

    if (!materia || !materiaPrevia) {
      return res.status(404).json({
        success: false,
        error: "Una o ambas materias no fueron encontradas"
      });
    }

    // Verificar que no se esté intentando agregar la misma materia como previa de sí misma
    if (materiaId === materiaPreviaId) {
      return res.status(400).json({
        success: false,
        error: "Una materia no puede ser previa de sí misma"
      });
    }

    // Verificar que la previa no exista ya
    const previaExistente = await Previa.findOne({
      materiaBase: materiaId,
      materiaPrevia: materiaPreviaId
    });

    if (previaExistente) {
      return res.status(400).json({
        success: false,
        error: "Esta previa ya existe"
      });
    }

    // Crear la nueva previa
    const nuevaPrevia = new Previa({
      materiaBase: materiaId,
      materiaPrevia: materiaPreviaId,
      requisito: requisito
    });

    await nuevaPrevia.save();

    res.status(201).json({
      success: true,
      message: "Previa agregada exitosamente"
    });

  } catch (err) {
    console.error('Error en agregarPrevia:', err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

const eliminarPrevia = async function (req, res) {
  try {
    const { materiaId, materiaPreviaId } = req.body;

    // Validaciones
    if (!materiaId || !materiaPreviaId) {
      return res.status(400).json({
        success: false,
        error: "Los campos materiaId y materiaPreviaId son requeridos"
      });
    }

    // Buscar y eliminar la previa
    const previaEliminada = await Previa.findOneAndDelete({
      materiaBase: materiaId,
      materiaPrevia: materiaPreviaId
    });

    if (!previaEliminada) {
      return res.status(404).json({
        success: false,
        error: "Previa no encontrada"
      });
    }

    res.status(200).json({
      success: true,
      message: "Previa eliminada exitosamente"
    });

  } catch (err) {
    console.error('Error en eliminarPrevia:', err);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor"
    });
  }
};

const getAllMateriasEstudiantes = async function (req, res) {
  try {
    const result = await getAllMaterias();
    const userId = req.userAuth.userInfo.id
    const previas = await Previa.find();
    const historial = await Cursa.find({ usuario: userId });

    res.render("estudiante/estudianteMaterias", {
      success: true,
      materias: result.materias,
      total: result.totalMaterias,
      previas,
      historial
    });

  } catch (error) {
    console.error("Error en getAllMateriasController:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMateriaByUser = async function (req, res) {
  try {
    const result = await getAllMaterias();
    const userId = req.userAuth.userInfo.id
    const historial = await Cursa.find({ usuario: userId }).populate("materia");
    let totalCreditos = 0;
    historial.forEach(entry => {
      if (entry.estado.toLowerCase() === 'aprobada' && entry.materia && entry.materia.creditos) {
        totalCreditos += entry.materia.creditos;
      }
    });

    res.render("estudiante/estudianteHistorial", {
      success: true,
      materias: result.materias,
      historial,
      totalCreditos
    });

  } catch (error) {
    console.error("Error en getAllMateriasController:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const buscarHistorial = async function (req, res) {
  try {
    const { searchTerm } = req.params;

    if (!searchTerm || typeof searchTerm !== 'string') {
      return res.status(400).json({ error: 'Parámetro de búsqueda inválido' });
    }

    // Primero buscar materias que coincidan
    const materiasQuery = {
      $or: [
        { nombre: { $regex: searchTerm, $options: 'i' } },
        { semestre: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (!isNaN(searchTerm)) {
      materiasQuery.$or.push({ creditos: Number(searchTerm) });
    }

    const materias = await Materia.find(materiasQuery);
    const materiaIds = materias.map(m => m._id);

    // Luego buscar en el historial
    const searchQuery = {
      $or: [
        { estado: { $regex: searchTerm, $options: 'i' } },
        { materia: { $in: materiaIds } }
      ]
    };

    const historial = await Cursa.find(searchQuery)
      .populate('materia')
      .populate('usuario')
      .sort({ estado: 1 });

    res.json({ historial });

  } catch (err) {
    console.error('Error en buscar historial:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllMaterias,
  crearMateria,
  getMateriaById,
  editarMateria,
  eliminarMateria,
  buscarMaterias,
  getPreviasById,
  agregarPrevia,
  eliminarPrevia,
  getAllMateriasEstudiantes,
  getMateriaByUser,
  buscarHistorial
};