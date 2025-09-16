const bcrypt = require("bcrypt");
const User = require("../model/User");
const Cursa = require("../model/Cursa");
const Materia = require("../model/Materia");

const registrarUsuario = async function (req, res) {
    try {
        // Extraemos los campos que necesitamos del body
        const { username, email, password } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos (username, email, password)"
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "El formato del email no es válido"
            });
        }

        // Validar longitud del username
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                error: "El username debe tener entre 3 y 30 caracteres"
            });
        }

        // Validar formato del username (solo letras, números, puntos y guiones)
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                error: "El username solo puede contener letras, números, puntos, guiones y guiones bajos"
            });
        }

        // Validar fortaleza de la contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        // Verificar que el email no esté ya registrado
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este email"
            });
        }

        // Verificar que el username no esté ya registrado
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este username"
            });
        }

        // Normalizar datos
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        const rol = "Estudiante";

        // Crear el nuevo usuario con los datos correctos
        const nuevoUsuario = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            rol
        });

        // Guardar en la base de datos
        await nuevoUsuario.save();

        // Responder con éxito
        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            redirectTo: "/user/login"
        });

    } catch (err) {

        console.error('Error en crearUsuario:', err);

        // Manejo específico de errores de MongoDB
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `Ya existe un usuario con este ${field}`
            });
        }

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

const getAllUsers = async function (page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        const users = await User.find()
            .skip(skip)
            .limit(limit)
            .sort({ username: 1 });

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users,
            currentPage: page,
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    } catch (err) {
        console.error("Error al obtener usuarios:", err);
        throw err;
    }
};

const editarUsuario = async function (req, res) {
    try {
        const { id, username, email, rol } = req.body;

        if (!id || !username || !email || !rol) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos (id, username, email, rol)"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "El formato del email no es válido"
            });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                error: "El username debe tener entre 3 y 30 caracteres"
            });
        }

        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                error: "El username solo puede contener letras, números, puntos, guiones y guiones bajos"
            });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este email"
            });
        }

        const existingUsername = await User.findOne({ username: username.toLowerCase(), _id: { $ne: id } });
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este username"
            });
        }
        // Normalizar datos
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        const usuarioActualizado = await User.findByIdAndUpdate(
            id,
            { username: normalizedUsername, email: normalizedEmail, rol },
            { new: true, runValidators: true }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Usuario editado exitosamente",
            data: usuarioActualizado
        });

    } catch (err) {
        console.error('Error en editarUsuario:', err);

        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `Ya existe un usuario con este ${field}`
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

const getUserById = async function (req, res) {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Aquí devolvemos el usuario al frontend
        res.json(user);
    } catch (err) {
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
};

const crearUsuario = async function (req, res) {
    try {
        // Extraemos los campos que necesitamos del body
        const { username, email, password, rol } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!username || !email || !password || !rol) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos (username, email, password, rol)"
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: "El formato del email no es válido"
            });
        }

        // Validar longitud del username
        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({
                success: false,
                error: "El username debe tener entre 3 y 30 caracteres"
            });
        }

        // Validar formato del username (solo letras, números y guiones)
        const usernameRegex = /^[a-zA-Z0-9._-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                success: false,
                error: "El username solo puede contener letras, números, puntos, guiones y guiones bajos"
            });
        }

        // Validar fortaleza de la contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: "La contraseña debe tener al menos 6 caracteres"
            });
        }

        // Verificar que el email no esté ya registrado
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este email"
            });
        }

        // Verificar que el username no esté ya registrado
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: "Ya existe un usuario con este username"
            });
        }

        // Normalizar datos
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario con los datos correctos
        const nuevoUsuario = new User({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            rol
        });

        // Guardar en la base de datos
        await nuevoUsuario.save();

        // Responder con éxito
        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente"
        });

    } catch (err) {

        console.error('Error en crearUsuario:', err);

        // Manejo específico de errores de MongoDB
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                success: false,
                error: `Ya existe un usuario con este ${field}`
            });
        }

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

const eliminarUsuario = async function (req, res) {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado"
            });
        }
        await User.findByIdAndDelete(user.id);
        res.status(200).json({
            success: true,
            message: "Usuario eliminado exitosamente"
        });
    }
    catch (err) {
        console.error('Error en eliminarUsuario:', err);
        return res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
}

const buscarUsuarios = async function (req, res) {
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
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { rol: { $regex: search, $options: 'i' } }
            ]
        };

        const users = await User.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .sort({ username: 1 });
        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            users,
            currentPage: page,
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1
        });
    } catch (err) {
        console.error('Error en buscar usuarios:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

const getHistorial = async function (req, res) {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Traemos historial y populamos el nombre de la materia
        const historial = await Cursa.find({ usuario: user._id })
            .populate("materia", "nombre codigo") 

        res.json({ success: true, historial });
    } catch (err) {
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
};

const agregarHistorial = async function (req, res) {
    try {
        const { userId, materiaId, estado } = req.body;
        // Validaciones
        if (!userId || !materiaId || !estado) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos (userId, materiaId, estado)"
            });
        }

        const usuario = await User.findById(userId);
        const materia = await Materia.findById(materiaId);
        // Crear la nueva previa
        const nuevoCursa = new Cursa({
            usuario,
            materia,
            estado
        });

        await nuevoCursa.save();
        res.status(201).json({
            success: true,
            message: "Historial agregado exitosamente",
            nombreMateria: materia.nombre
        });

    } catch (err) {
        console.error('Error en agregarHistorial:', err);
        return res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
};

const eliminarHistorial = async function (req, res) {
    try {
        const { historialId } = req.body;
        if (!historialId) {
            return res.status(400).json({
                success: false,
                error: "El campo historialId es requerido"
            });
        }

        const historial = await Cursa.findById(historialId);
        const historialEliminado = await Cursa.findOneAndDelete({
            _id: historial
        });

        if (!historialEliminado) {
            return res.status(400).json({
                success: false,
                error: "Historial no encontrada"
            });
        }

        res.status(200).json({
            success: true,
            message: "Historial eliminado exitosamente"
        });

    } catch (err) {
        console.error('Error en eliminarHistorial:', err);
        return res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
};

const getHistorialById = async function (req, res) {
    try {
        const { id } = req.params;

        const historial = await Cursa.findById(id);

        if (!historial) {
            return res.status(404).json({ message: "Historial no encontrado" });
        }

        // Aquí devolvemos la materia al frontend
        res.json(historial);
    } catch (err) {
        console.error("Error al obtener historial:", err);
        res.status(500).json({ message: "Error del servidor" });
    }
};

const editarHistorial = async function (req, res) {
    try {
        // Extraemos los campos que necesitamos del body
        const { id, estado } = req.body;

        // Verificar que todos los campos requeridos estén presentes
        if (!id || !estado) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos (id, estado)"
            });
        }

        const historialActualizado = await Cursa.findByIdAndUpdate(
            id,
            { estado },
            { new: true, runValidators: true }
        );

        if (!historialActualizado) {
            return res.status(404).json({
                success: false,
                error: "Historial no encontrado"
            });
        }

        res.status(200).json({
            success: true,
            message: "Historial editado exitosamente",
            data: historialActualizado
        });

    } catch (err) {
        console.error('Error en editarHistorial:', err);

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


module.exports = {
    registrarUsuario,
    getAllUsers,
    crearUsuario,
    getUserById,
    editarUsuario,
    eliminarUsuario,
    buscarUsuarios,
    getHistorial,
    agregarHistorial,
    eliminarHistorial,
    getHistorialById,
    editarHistorial
};