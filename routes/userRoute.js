const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const userController = require("../controller/userController");

router.get("/register", (req, res) => {
  const token = req.cookies?.token;
  let userInfo;
  try {
    userInfo = req.cookies?.userInfo ? JSON.parse(req.cookies.userInfo) : null;
  } catch (err) {
    userInfo = null;
  }

  const rol = userInfo?.rol;
  if (token && rol === "Estudiante") {
     res.redirect("/");
  } else if(token && rol === "Administrador"){
      res.redirect("/admin/usuarios");
  } else{
      res.render("user/userRegister");
  }
})

router.get("/login", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
     res.redirect("/");
  } 
    else{
        res.render("user/userLogin");
    }
})

router.post("/registrarUsuario", userController.registrarUsuario)

router.post("/auth", authController.userAuth);

module.exports = router;