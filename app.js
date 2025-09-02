const express = require("express");
var connectDB = require("./db/connection")
const app = express();
const userRoutes = require("./routes/userRoute");
const adminRoutes = require("./routes/adminRoute");
const path = require("path");
const { authenticateToken } = require('./middleware/authenticateUser')
const cookieParser = require('cookie-parser')
const PORT = process.env['PORT'] || 5000

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use((req, res, next) => {
  try {
    const userInfo = req.cookies?.userInfo ? JSON.parse(req.cookies.userInfo) : null;
    res.locals.id = userInfo?.id || '';
    res.locals.username = userInfo?.username || '';
    res.locals.rol = userInfo?.rol || '';
  } catch {
    res.locals.id = '';
    res.locals.username = '';
    res.locals.rol = '';
  }
  next();
});;

connectDB()


// Ruta del dashboard (protegida)
app.get('/', (req, res) => {
  const token = req.cookies?.token;
  let userInfo;
  try {
    userInfo = req.cookies?.userInfo ? JSON.parse(req.cookies.userInfo) : null;
  } catch (err) {
    userInfo = null;
  }
  const rol = userInfo?.rol;
  if (token && rol === "Estudiante") {
     res.render("index");
  } else if(token && rol === "Administrador") {
    res.redirect('/admin/usuarios');
  } else {
    res.redirect('/user/login');
  }
});

// Usar rutas con prefijos
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
// Puerto (Replit usa process.env.PORT)
app.listen(5000, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:5000`);
});
