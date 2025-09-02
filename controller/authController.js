const bcrypt = require("bcrypt");
const User = require("../model/User");
const { generateToken } = require('../middleware/authenticateUser');

const userAuth = async function (req, res) {
    try {
        const userData = await userLoginAuthenticate(req.body);
        if (userData) {
            // Generar token JWT
            const token = generateToken({
                id: userData._id,
                username: userData.username,
                email: userData.email,
                rol: userData.rol
            });

            // Guardar token en cookie (opcional)
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });

            res.cookie('userInfo', JSON.stringify({
                id: userData._id,
                username: userData.username,
                rol: userData.rol
            }), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });

            // Responder con JSON indicando éxito
            delete userData.password;
            res.json({
                success: true,
                message: "Inicio de sesión exitoso",
                redirectTo: "/" // URL a donde redireccionar
            });
        }
    } catch (err) {
        console.log("Error en userAuth:", err);

        // Responder con JSON indicando error
        res.json({
            success: false,
            error: err // El mensaje de error que viene de userLoginAuthenticate
        });
    }
};

const userLoginAuthenticate = (body) => {
    return new Promise((resolve, reject) => {
        if (!body || !body.username || !body.password) {
            reject("Por favor ingresa las credenciales");
        } else {
            User.findOne({ username: body.username }).then((user) => { 
                if (user !== null) {
                    bcrypt.compare(body.password, user.password).then((status) => {
                        if (status) {
                            resolve(user);
                        } else {
                            reject("Usuario o contraseña incorrectos");
                        }
                    }).catch((bcryptError) => {
                        console.log("Error en bcrypt:", bcryptError);
                        reject("Error al verificar la contraseña");
                    });
                } else {
                    reject("Usuario o contraseña incorrectos");
                }
            }).catch((dbError) => {
                console.log("Error en base de datos:", dbError);
                reject("Error al buscar el usuario");
            });
        }
    });
};

// Admin logout
const userLogout = function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.log("Error al cerrar sesión:", err);
        }
        // Limpiar cookies
        res.clearCookie('token');
        res.clearCookie('userInfo');
        res.redirect("/login");
    });
};

module.exports = {
    userAuth,
    userLogout
};