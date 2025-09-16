const connectedUsers = new Map(); // Para rastrear usuarios conectados

const initializeSocketNotifications = (io) => {

    io.on('connection', (socket) => {
        console.log('Usuario conectado:', socket.id);
        
        socket.on('user_connected', (userId) => {
            if (userId && userId !== 'undefined') {
                connectedUsers.set(userId, socket.id);
                socket.userId = userId;
                console.log(`Usuario ${userId} conectado con socket ${socket.id}`);
            } else {
                console.error('userId inválido recibido:', userId);
            }
        });
        
        socket.on('disconnect', () => {
            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                console.log(`Usuario ${socket.userId} desconectado`);
            }
        });
    });

    // Función para enviar notificaciones a estudiantes
    const sendNotificationToStudents = async (notification) => {
        try {
            const User = require('../model/User');
            const estudiantes = await User.find({ rol: 'Estudiante' });
            
            console.log(`Enviando notificación a ${estudiantes.length} estudiantes`);
            
            let notificationsSent = 0;
            estudiantes.forEach(estudiante => {
                const socketId = connectedUsers.get(estudiante._id.toString());
                if (socketId) {
                    io.to(socketId).emit('new_notification', notification);
                    notificationsSent++;
                    console.log(`Notificación enviada a usuario ${estudiante._id}`);
                }
            });
            
            console.log(`Total notificaciones enviadas: ${notificationsSent}`);
        } catch (error) {
            console.error('Error enviando notificaciones:', error);
        }
    };

    return {
        sendNotificationToStudents
    };
};

module.exports = { initializeSocketNotifications };