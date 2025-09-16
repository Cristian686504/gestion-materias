const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const materiaController = require("../controller/materiaController");
const { adminOnly } = require('../middleware/authMiddleware');

// Aplicar middleware de admin a todas las rutas
router.use(adminOnly);


// Ruta de usuarios
router.get("/usuarios", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await userController.getAllUsers(page, limit);

        res.render("admin/adminUsuarios", {
            users: result.users,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalUsers: result.totalUsers,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev,
                limit: limit
            },
            userAuth: req.userAuth
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error');
    }
});

router.post("/crearUsuario", userController.crearUsuario); 

router.get("/getUserById/:id", userController.getUserById);

router.put("/editarUsuario", userController.editarUsuario); 

router.delete("/eliminarUsuario/:id", userController.eliminarUsuario);

router.get("/buscarUsuarios/:search", userController.buscarUsuarios);

// Ruta de materias

router.get("/materias", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await materiaController.getAllMaterias(page, limit);

        res.render("admin/adminMaterias", {
            materias: result.materias,
            pagination: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalMaterias: result.totalMaterias,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev,
                limit: limit
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error');
    }
});

router.post("/crearMateria", materiaController.crearMateria);

router.get("/getMateriaById/:id", materiaController.getMateriaById);

router.put("/editarMateria", materiaController.editarMateria); 

router.delete("/eliminarMateria/:id", materiaController.eliminarMateria);

router.get("/buscarMaterias/:search", materiaController.buscarMaterias);

router.get("/getAllMaterias", async (req, res) => {
    try {
        // Llamar al controlador sin parámetros de paginación para obtener todas las materias
        const result = await materiaController.getAllMaterias();
        
        res.json({
            success: true,
            materias: result.materias,
            totalMaterias: result.totalMaterias
        });
    } catch (error) {
        console.error('Error al obtener todas las materias:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las materias'
        });
    }
});

router.get("/getPrevias/:id", materiaController.getPreviasById);

router.post("/agregarPrevia", materiaController.agregarPrevia);

router.delete("/eliminarPrevia", materiaController.eliminarPrevia);

router.get("/historial/:id", userController.getHistorial);

router.post("/agregarHistorial", userController.agregarHistorial);

router.delete("/eliminarHistorial", userController.eliminarHistorial);

module.exports = router;