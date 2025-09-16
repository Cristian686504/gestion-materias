const express = require("express");
const router = express.Router();
const materiaController = require("../controller/materiaController");
const userController = require("../controller/userController");
const notificacionController = require("../controller/notificacionController");
const { studentOnly } = require('../middleware/authMiddleware');


router.use(studentOnly);

router.get("/materias", materiaController.getAllMateriasEstudiantes);

router.get("/historial", materiaController.getMateriaByUser);

router.post("/historial", userController.agregarHistorial);

router.get("/getHistorialById/:id", userController.getHistorialById);

router.put("/editarHistorial", userController.editarHistorial);

router.delete("/eliminarHistorial", userController.eliminarHistorial);

router.get("/buscarHistorial/:searchTerm", materiaController.buscarHistorial);

router.get("/matriculacion", (req, res) => {
  res.render("estudiante/estudianteMatriculacion", {
            userAuth: req.userAuth
        });
});

router.get('/notificaciones/count', notificacionController.getNotificationCount);

router.get('/notificaciones/list', notificacionController.getNotificationList);

router.post('/notificaciones/mark-all-read', notificacionController.markAllAsRead);

router.delete('/notificaciones/:id', notificacionController.eliminarNotificacion);

router.post('/notificaciones/clear-all', notificacionController.clearAll);

module.exports = router;