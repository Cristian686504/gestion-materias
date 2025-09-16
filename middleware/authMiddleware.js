const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

// Función para generar token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    req.userAuth = { isAuthenticated: false, userInfo: null };
    res.locals.userAuth = req.userAuth;
    return next();
  }

  let userInfo;
  try {
    userInfo = req.cookies?.userInfo ? JSON.parse(req.cookies.userInfo) : null;
  } catch (err) {
    userInfo = null;
  }

  req.userAuth = {
    isAuthenticated: true,
    token,
    userInfo,
    rol: userInfo?.rol
  };

  res.locals.userAuth = req.userAuth;

  next();
};


const requireAuth = (req, res, next) => {
  if (!req.userAuth?.isAuthenticated) {
    return res.redirect("/user/login");
  }
  next();
};


const studentOnly = (req, res, next) => {
  const { isAuthenticated, rol } = req.userAuth || {};

  if (!isAuthenticated) {
    return res.redirect("/user/login");
  }

  if (rol === "Administrador") {
    return res.redirect("/admin/materias");
  }

  if (rol !== "Estudiante") {
    return res.redirect("/user/login");
  }

  next();
};

const adminOnly = (req, res, next) => {
  const { isAuthenticated, rol } = req.userAuth || {};

  if (!isAuthenticated) {
    return res.redirect("/user/login");
  }

  if (rol === "Estudiante") {
    return res.redirect("/estudiante/materias");
  }

  if (rol !== "Administrador") {
    return res.redirect("/user/login");
  }

  next();
};

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  studentOnly,
  adminOnly
};