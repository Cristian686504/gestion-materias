const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env['JWT_SECRET']

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  // Buscar el token en el header Authorization o en cookies
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;
  console.log("Token: " , token)
  if (!token) {
    return res.status(401).render('user/userLogin', { 
      error: 'Acceso denegado. Token requerido.' 
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Agregar datos del usuario al request
    next();
  } catch (error) {
    return res.status(403).render('login', { 
      error: 'Token inválido o expirado.' 
    });
  }
};

// Función para generar token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Función para verificar token sin middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken,
  JWT_SECRET
};