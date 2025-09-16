# Sistema de Gestión Académica

Sistema web para la gestión de materias universitarias con funcionalidades para estudiantes y administradores. Desarrollado con Node.js, Express y MongoDB, incluye notificaciones en tiempo real mediante Socket.IO.

## 🚀 Setup y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- MongoDB
- npm

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Cristian686504/gestion-materias.git
   cd gestion-materias
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sistema_academico
   JWT_SECRET=tu_clave_secreta_jwt
   NODE_ENV=development
   ```

4. **Poblar la base de datos (opcional)**
   ```bash
   npm run seed
   ```

5. **Iniciar el servidor**
   ```bash
   node app.js
   ```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
├── controller/          # Controladores de la aplicación
├── db/                 # Configuración de base de datos
├── middleware/         # Middlewares (autenticación, etc.)
├── models/            # Modelos de MongoDB
├── public/            # Archivos estáticos (CSS, JS, imágenes)
├── routes/            # Definición de rutas
├── sockets/           # Configuración de Socket.IO
├── views/             # Plantillas EJS
├── index.js           # Punto de entrada de la aplicación (No se está usando)
└── package.json       # Dependencias y scripts
```

## 🔐 Sistema de Autenticación

El sistema implementa autenticación basada en JWT con dos roles principales:

- **Estudiante**: Acceso a materias, historial académico y notificaciones
- **Administrador**: Gestión completa de usuarios y materias

### Middleware de Autenticación
- `verifyToken`: Verifica la validez del token JWT
- `studentOnly`: Restringe acceso solo a estudiantes
- `adminOnly`: Restringe acceso solo a administradores

## 🛣️ Endpoints API

### Rutas de Usuario (`/user`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/register` | Página de registro | Público |
| GET | `/login` | Página de login | Público |
| POST | `/registrarUsuario` | Registrar nuevo usuario | Público |
| POST | `/auth` | Autenticar usuario | Público |
| POST | `/logout` | Cerrar sesión | Autenticado |

### Rutas de Estudiante (`/estudiante`)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/materias` | Ver todas las materias disponibles | Estudiante |
| GET | `/historial` | Ver historial académico | Estudiante |
| POST | `/historial` | Agregar materia al historial | Estudiante |
| GET | `/getHistorialById/:id` | Obtener historial por ID | Estudiante |
| PUT | `/editarHistorial` | Editar estado del historial | Estudiante |
| DELETE | `/eliminarHistorial` | Eliminar materia del historial | Estudiante |
| GET | `/buscarHistorial/:searchTerm` | Buscar en el historial | Estudiante |
| GET | `/matriculacion` | Página de matriculación | Estudiante |

#### Notificaciones para Estudiantes
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/notificaciones/count` | Contar notificaciones no leídas | Estudiante |
| GET | `/notificaciones/list` | Listar notificaciones | Estudiante |
| POST | `/notificaciones/mark-all-read` | Marcar todas como leídas | Estudiante |
| DELETE | `/notificaciones/:id` | Eliminar notificación | Estudiante |
| POST | `/notificaciones/clear-all` | Limpiar todas las notificaciones | Estudiante |

### Rutas de Administrador (`/admin`)

#### Gestión de Usuarios
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/usuarios` | Listar usuarios (con paginación) | Admin |
| POST | `/crearUsuario` | Crear nuevo usuario | Admin |
| GET | `/getUserById/:id` | Obtener usuario por ID | Admin |
| PUT | `/editarUsuario` | Editar usuario | Admin |
| DELETE | `/eliminarUsuario/:id` | Eliminar usuario | Admin |
| GET | `/buscarUsuarios/:search` | Buscar usuarios | Admin |

#### Gestión de Materias
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/materias` | Listar materias (con paginación) | Admin |
| POST | `/crearMateria` | Crear nueva materia | Admin |
| GET | `/getMateriaById/:id` | Obtener materia por ID | Admin |
| PUT | `/editarMateria` | Editar materia | Admin |
| DELETE | `/eliminarMateria/:id` | Eliminar materia | Admin |
| GET | `/buscarMaterias/:search` | Buscar materias | Admin |
| GET | `/getAllMaterias` | Obtener todas las materias | Admin |

#### Gestión de Previas
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/getPrevias/:id` | Obtener materias previas de una materia específica| Admin |
| POST | `/agregarPrevia` | Agregar materia previa | Admin |
| DELETE | `/eliminarPrevia` | Eliminar materia previa | Admin |

#### Gestión de Historial (Admin)
| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| GET | `/historial/:id` | Ver historial de un estudiante | Admin |
| POST | `/agregarHistorial` | Agregar al historial | Admin |
| DELETE | `/eliminarHistorial` | Eliminar del historial | Admin |

## 🔌 Socket.IO - Notificaciones en Tiempo Real

El sistema incluye notificaciones en tiempo real usando Socket.IO:

### Funciones Globales Disponibles
- `sendNotificationToStudents()`: Envía notificaciones a todos los estudiantes conectados
- `sendNotificationToUser(userId, notification)`: Envía notificación a un usuario específico
- `getConnectedUsers()`: Obtiene lista de usuarios conectados
- `isUserConnected(userId)`: Verifica si un usuario está conectado

### Eventos Socket.IO
- `connection`: Usuario se conecta
- `disconnect`: Usuario se desconecta
- `notification`: Recepción de notificaciones

## 🎨 Frontend

### Tecnologías Utilizadas
- **Motor de plantillas**: EJS
- **CSS**: Vanilla CSS
- **JavaScript**: Vanilla JS con Socket.IO cliente
- **Visualización**: Cytoscape.js para gráficos de dependencias

### Vistas Principales
- **Estudiante**: Materias, historial, matriculación
- **Administrador**: Gestión de usuarios y materias
- **Autenticación**: Login y registro

## 🗄️ Base de Datos

### MongoDB con Mongoose
El sistema utiliza MongoDB como base de datos principal con los siguientes modelos:

- **Usuario**: Información de estudiantes y administradores
- **Materia**: Información de las materias académicas
- **Historial**: Registro académico de los estudiantes
- **Notificación**: Sistema de notificaciones

### Características
- Paginación automática en listados
- Búsqueda por texto
- Relaciones entre materias (previas)
- Auto-incremento de IDs con `mongoose-sequence`

## 🔧 Decisiones de Diseño

### Arquitectura MVC
- **Modelos**: Definición de esquemas de datos con Mongoose
- **Vistas**: Plantillas EJS para el frontend
- **Controladores**: Lógica de negocio separada por funcionalidad

### Seguridad
- **JWT**: Autenticación basada en tokens
- **Cookies**: Almacenamiento seguro de tokens e información de usuario
- **Middleware**: Verificación de autenticación y autorización por roles
- **Bcrypt**: Hash de contraseñas

### Escalabilidad
- **Paginación**: Implementada en todos los listados
- **Búsqueda**: Funcionalidad de búsqueda en tiempo real
- **Socket.IO**: Comunicación en tiempo real sin sobrecarga del servidor

### Experiencia de Usuario
- **Redirección automática**: Según el rol del usuario
- **Notificaciones**: Sistema de notificaciones en tiempo real
- **Interfaz responsiva**: Diseño adaptable a diferentes dispositivos

### Logging
- **Morgan**: Logging detallado de peticiones HTTP en formato "combined"
- **Console**: Logs de errores y eventos importantes

## 🚀 Funcionalidades Principales

1. **Gestión de Usuarios**: CRUD completo con roles diferenciados
2. **Sistema de Materias**: Gestión de materias con dependencias (previas)
3. **Historial Académico**: Seguimiento del progreso estudiantil
4. **Notificaciones**: Notificaciones en tiempo real
5. **Matriculación**: Vídeo de inscripción a materias
6. **Búsqueda**: Funcionalidad de búsqueda en todos los módulos
7. **Paginación**: Navegación eficiente de grandes conjuntos de datos

## 📝 Notas de Desarrollo

### Dependencias Principales
- **Express 5.1.0**: Framework web
- **Mongoose**: ODM para MongoDB
- **Socket.IO**: WebSockets para tiempo real
- **JWT**: Autenticación
- **EJS**: Motor de plantillas
- **Bcrypt**: Hashing de contraseñas
- **Morgan**: HTTP logging

### Configuración de Desarrollo
- Servidor HTTP con Socket.IO integrado
- Variables de entorno para configuración
- Middleware global para autenticación
- Archivos estáticos servidos desde `/public`