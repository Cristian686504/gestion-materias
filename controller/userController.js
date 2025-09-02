const bcrypt = require("bcrypt");
const User = require("../model/User");

const registrarUsuario = async function (req, res) {
    try {
        // Extraemos los campos que necesitamos del body
        const { username, email, password } = req.body;

        // ===== CONTROLES DE VALIDACIÓN =====

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

        // Validar formato del username (solo letras, números y guiones)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ 
                success: false,
                error: "El username solo puede contener letras, números, guiones y guiones bajos" 
            });
        }

        // Validar fortaleza de la contraseña
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: "La contraseña debe tener al menos 6 caracteres" 
            });
        }

        // ===== CONTROLES DE UNICIDAD =====

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

        // ===== SANITIZACIÓN =====

        // Normalizar datos
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // ===== CREACIÓN DEL USUARIO =====

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

        // ===== RESPUESTA EXITOSA =====

        // Responder con éxito
        res.status(201).json({ 
            success: true,
            message: "Usuario creado exitosamente",
            redirectTo: "/user/login"
        });

    } catch (err) {
        // ===== MANEJO DE ERRORES =====

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

const getAllUsers = async function () {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    throw err;
  }
};

const crearUsuario = async function (req, res) {
    try {
        // Extraemos los campos que necesitamos del body
        const { username, email, password, rol } = req.body;

        // ===== CONTROLES DE VALIDACIÓN =====

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
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ 
                success: false,
                error: "El username solo puede contener letras, números, guiones y guiones bajos" 
            });
        }

        // Validar fortaleza de la contraseña
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: "La contraseña debe tener al menos 6 caracteres" 
            });
        }

        // ===== CONTROLES DE UNICIDAD =====

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

        // ===== SANITIZACIÓN =====

        // Normalizar datos
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedUsername = username.toLowerCase().trim();

        // ===== CREACIÓN DEL USUARIO =====

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

        // ===== RESPUESTA EXITOSA =====
        // Responder con éxito
        res.status(201).json({ 
            success: true,
            message: "Usuario creado exitosamente",
            redirectTo: "/user/login"
        });

    } catch (err) {
        // ===== MANEJO DE ERRORES =====

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

const getUserById = async function (req, res) {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    throw err;
  }
};

module.exports = {
    registrarUsuario,
    getAllUsers,
    crearUsuario,
    getUserById
};