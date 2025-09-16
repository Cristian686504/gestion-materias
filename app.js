require('dotenv').config();
const express = require("express");
var connectDB = require("./db/connection");
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");
const estudianteRoutes = require("./routes/estudianteRoute");
const path = require("path");
const cookieParser = require('cookie-parser');
const { verifyToken } = require('./middleware/authMiddleware');
const http = require("http");
const { Server } = require("socket.io");
const { initializeSocketNotifications } = require('./sockets/socketNotificacion');
const morgan = require("morgan");


const app = express();
const server = http.createServer(app); // Crear servidor HTTP
const io = new Server(server); // Inicializar Socket.IO

const PORT = process.env.PORT;

app.use(morgan("combined")); //Logs detallados de peticiones

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

// Hacer io accesible globalmente
app.set('io', io);

// Aplicar el middleware de verificación de token globalmente
app.use(verifyToken);

connectDB();

// Usar rutas con prefijos
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/estudiante", estudianteRoutes);

// Inicializar Socket.IO y obtener funciones de notificación
const socketNotifications = initializeSocketNotifications(io);

// Hacer las funciones de notificación accesibles globalmente
global.sendNotificationToStudents = socketNotifications.sendNotificationToStudents;
global.sendNotificationToUser = socketNotifications.sendNotificationToUser;
global.getConnectedUsers = socketNotifications.getConnectedUsers;
global.isUserConnected = socketNotifications.isUserConnected;

app.use(/.*/, (req, res) => {
    const { isAuthenticated, rol } = req.userAuth;
    
    if (isAuthenticated) {
        if (rol === "Estudiante") {
            res.redirect('/estudiante/materias');
        } else if (rol === "Administrador") {
            res.redirect('/admin/usuarios');
        } else {
            res.redirect('/user/login');
        }
    } else {
        res.redirect('/user/login');
    }
});

// Usar server.listen en lugar de app.listen
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});