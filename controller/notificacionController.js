const Notificacion = require('../model/Notificaciones');

const getNotificationCount = async function (req, res) {
    try {
        const userId = req.userAuth.userInfo.id;
        const count = await Notificacion.countDocuments({
            usuario: userId,
            leido: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error al obtener conteo de notificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const getNotificationList = async function (req, res) {
    try {
        const userId = req.userAuth.userInfo.id;
        const limit = parseInt(req.query.limit) || 20;

        const notificaciones = await Notificacion.find({ usuario: userId })
            .sort({ fechaCreacion: -1 })  // Ahora coincide con el esquema
            .limit(limit);

        res.json({ notificaciones });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const markAllAsRead = async function (req, res) {
    try {
        const userId = req.userAuth.userInfo.id;

        await Notificacion.updateMany(
            { usuario: userId, leido: false },
            { leido: true }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error al marcar notificaciones como leídas:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

const eliminarNotificacion = async function (req, res) {
    try {
        const userId = req.userAuth.userInfo.id;
        const notificationId = req.params.id;

        const result = await Notificacion.findOneAndDelete({
            _id: notificationId,
            usuario: userId
        });

        if (!result) {
            return res.status(404).json({ success: false, error: 'Notificación no encontrada' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

const clearAll = async function (req, res) {
    try {
        const userId = req.userAuth.userInfo.id;

        await Notificacion.deleteMany({ usuario: userId });

        res.json({ success: true });
    } catch (error) {
        console.error('Error al limpiar notificaciones:', error);
        res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
};

module.exports = {
    getNotificationCount,
    getNotificationList,
    markAllAsRead,
    eliminarNotificacion,
    clearAll
};