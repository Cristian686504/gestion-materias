const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.get("/usuarios", async (req, res) => {
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
    try {
      // Esperamos la promesa para obtener el array de usuarios
      const users = await userController.getAllUsers();
      res.render("admin/adminUsuarios", { users }); // ahora users es un array real
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      res.status(500).send("Error al obtener usuarios");
    }
  } else{
      res.redirect("/user/login");
  }
})

router.post("/crearUsuario", (req, res) => {
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
    try {
      userController.crearUsuario(req, res);
    } catch (err) {
      console.error("Error al crear usuario:", err);
      res.status(500).send("Error al crear usuario");
    }
  } else{
      res.redirect("/user/login");
  }
  

})

router.get("/getUserById", (req, res) => {
  const token = req.cookies?.token;
  let userInfo;
  try{
    userInfo = req.cookies?.userInfo ? JSON.parse(req.cookies.userInfo) : null;
  }
  catch(err){
    userInfo = null;
  }

  const rol = userInfo?.rol;
  if (token && rol === "Estudiante"){
     res.redirect("/");
  } else if(token && rol === "Administrador") {
    try {
      userController.getUserById(req, res);
    } catch (err) {
      console.error("Error al obtener usuario:", err);
      res.status(500).send("Error al obtener usuario");
    }
  } else {
      res.redirect("/user/login");
  }
})



//router.post("/registrarUsuario", userController.registrarUsuario)

module.exports = router;