require('dotenv').config();
const mongoose = require('mongoose');
var connectDB = require("./db/connection");
const User = require('./model/User'); // Ajusta las rutas según tu estructura
const Materia = require('./model/Materia');
const Cursa = require('./model/Cursa');
const Previa = require('./model/Previa');
const Notificacion = require('./model/Notificaciones');

async function seedDatabase() {
    try {
        await connectDB();
        console.log('Conectado a MongoDB');

        // Limpiar colecciones existentes
        await User.deleteMany({});
        await Materia.deleteMany({});
        await Cursa.deleteMany({});
        await Previa.deleteMany({});
        await Notificacion.deleteMany({});

        // Reiniciar contador de códigos de materia
        await mongoose.connection.collection('counters').deleteOne({ _id: 'materia_codigo' });

        console.log('Colecciones limpiadas');

        //Crear usuarios
        const usuarios = await User.create([
            {
                username: 'admin1',
                email: 'admin@universidad.edu',
                password: '$2a$12$JnmD7jtIUyS8IODyEzrg0u5FKEEXfPAG1BECmi3xMtaR92oyDAJqq', // '1' hasheado
                rol: 'Administrador'
            },
            {
                username: 'admin2',
                email: 'admin2@universidad.edu',
                password: '$2a$12$ghR7FmRos3Zb5EiU..YhruHw5rh.HxjFPcYZg6TWZXQEfibC8Rm2a', // 'admin456' hasheado
                rol: 'Administrador'
            },
            {
                username: 'estudiante1',
                email: 'estudiante1@universidad.edu',
                password: '$2a$12$JnmD7jtIUyS8IODyEzrg0u5FKEEXfPAG1BECmi3xMtaR92oyDAJqq', // '1' hasheado
                rol: 'Estudiante'
            },
            {
                username: 'estudiante2',
                email: 'estudiante2@universidad.edu',
                password: '$2a$12$U.6wbdj2vtDjpVI9/nnm6eovu91D9dSbhPgXPKyGWkjac9ZnzP0si', // 'est456' hasheado
                rol: 'Estudiante'
            },
            {
                username: 'estudiante3',
                email: 'estudiante3@universidad.edu',
                password: '$2a$12$oPRlEjiQlVYVYrV2p75kLOvuMMkhttlM8UVJu7vEBL.AoAucWLOrO', // 'est789' hasheado
                rol: 'Estudiante'
            }
        ]);

        console.log('Usuarios creados:', usuarios.length);

        //Crear materias
        const materias = await Materia.create([
            // SEMESTRE 1 (índices 0-4) - 34 créditos total
            {
                nombre: 'Arquitectura',
                creditos: 6,
                semestre: 'Semestre 1',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Discreta y Lógica 1',
                creditos: 8,
                semestre: 'Semestre 1',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '22:00' }
                ]
            },
            {
                nombre: 'Principios de Programación',
                creditos: 6,
                semestre: 'Semestre 1',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Matemática',
                creditos: 8,
                semestre: 'Semestre 1',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '22:00' }
                ]
            },
            {
                nombre: 'Inglés Técnico',
                creditos: 6,
                semestre: 'Semestre 1',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' },
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '22:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '22:00' },
                    { dia: 'Viernes', horaInicio: '21:00', horaFin: '22:00' }
                ]
            },
            // SEMESTRE 2 (índices 5-9) - 32 créditos total
            {
                nombre: 'Sistemas Operativos',
                creditos: 6,
                semestre: 'Semestre 2',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Discreta y Lógica 2',
                creditos: 8,
                semestre: 'Semestre 2',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '22:00' }
                ]
            },
            {
                nombre: 'Estructura de Datos y Algoritmos',
                creditos: 6,
                semestre: 'Semestre 2',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Bases de Datos 1',
                creditos: 6,
                semestre: 'Semestre 2',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Inglés Técnico 2',
                creditos: 6,
                semestre: 'Semestre 2',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' },
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '22:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '22:00' },
                    { dia: 'Jueves', horaInicio: '21:00', horaFin: '22:00' }
                ]
            },
            // SEMESTRE 3 (índices 10-14) - 30 créditos total
            {
                nombre: 'Redes de Computadoras',
                creditos: 6,
                semestre: 'Semestre 3',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Programación Avanzada',
                creditos: 6,
                semestre: 'Semestre 3',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Bases de Datos 2',
                creditos: 6,
                semestre: 'Semestre 3',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Comunicación Oral y Escrita',
                creditos: 6,
                semestre: 'Semestre 3',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Contabilidad',
                creditos: 6,
                semestre: 'Semestre 3',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' },
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Martes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Jueves', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Viernes', horaInicio: '21:00', horaFin: '00:00' }
                ]
            },
            // SEMESTRE 4 (índices 15-19) - 30 créditos total
            {
                nombre: 'Administración de Infraestructura',
                creditos: 6,
                semestre: 'Semestre 4',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Probabilidad y Estadística',
                creditos: 6,
                semestre: 'Semestre 4',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Ingeniería de Software',
                creditos: 6,
                semestre: 'Semestre 4',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Programación de Aplicaciones',
                creditos: 6,
                semestre: 'Semestre 4',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Relaciones Personales y Laborales',
                creditos: 6,
                semestre: 'Semestre 4',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' },
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Martes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Jueves', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Viernes', horaInicio: '21:00', horaFin: '00:00' }
                ]
            },
            // SEMESTRE 5 (índices 20-25) - 36 créditos total
            {
                nombre: 'Taller de Aplicaciones de Internet Ricas',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Taller de Sistemas de Información Java EE',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Administración de Infraestructuras 2',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Pasantía Laboral',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Taller de Desarrollo de Aplicaciones Web con PHP',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Taller de Aplicaciones Para Dispositivos Móviles',
                creditos: 6,
                semestre: 'Semestre 5',
                horarios: [
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Martes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Jueves', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Viernes', horaInicio: '21:00', horaFin: '00:00' }
                ]
            },
            // SEMESTRE 6 (índices 26-31) - 36 créditos total
            {
                nombre: 'Sistemas de Gestión de Contenidos',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Lunes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Taller de Sistemas de Información .NET',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Martes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Introducción a los Sistemas de Control',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Miércoles', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Proyecto Final',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Jueves', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Taller de Gestión de la Innovación en Tecnologías',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Viernes', horaInicio: '18:00', horaFin: '21:00' }
                ]
            },
            {
                nombre: 'Introducción al Desarrollo de Juegos',
                creditos: 6,
                semestre: 'Semestre 6',
                horarios: [
                    { dia: 'Lunes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Martes', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Miércoles', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Jueves', horaInicio: '21:00', horaFin: '00:00' },
                    { dia: 'Viernes', horaInicio: '21:00', horaFin: '00:00' }
                ]
            }
        ]);

        console.log('Materias creadas:', materias.length);

        // Crear previas según las especificaciones
        const previas = [];

        // SEMESTRE 2
        // Sistemas Operativos: Arquitectura aprobada
        previas.push({
            materiaBase: materias[5]._id, // Sistemas Operativos
            materiaPrevia: materias[0]._id, // Arquitectura
            requisito: 'aprobada'
        });

        // Discreta y Lógica 2: Discreta y Lógica 1 aprobada
        previas.push({
            materiaBase: materias[6]._id, // Discreta y Lógica 2
            materiaPrevia: materias[1]._id, // Discreta y Lógica 1
            requisito: 'aprobada'
        });

        // Estructura de Datos y Algoritmos: Discreta y Lógica 1 aprobada y Principios de Programación aprobada
        previas.push({
            materiaBase: materias[7]._id, // Estructura de Datos y Algoritmos
            materiaPrevia: materias[1]._id, // Discreta y Lógica 1
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[7]._id, // Estructura de Datos y Algoritmos
            materiaPrevia: materias[2]._id, // Principios de Programación
            requisito: 'aprobada'
        });

        // Bases de Datos 1: Principios de Programación aprobada
        previas.push({
            materiaBase: materias[8]._id, // Bases de Datos 1
            materiaPrevia: materias[2]._id, // Principios de Programación
            requisito: 'aprobada'
        });

        // SEMESTRE 3
        // Redes de Computadoras: Arquitectura aprobada
        previas.push({
            materiaBase: materias[10]._id, // Redes de Computadoras
            materiaPrevia: materias[0]._id, // Arquitectura
            requisito: 'aprobada'
        });

        // Programación Avanzada: Estructura de Datos y Algoritmos aprobada
        previas.push({
            materiaBase: materias[11]._id, // Programación Avanzada
            materiaPrevia: materias[7]._id, // Estructura de Datos y Algoritmos
            requisito: 'aprobada'
        });

        // Bases de Datos 2: Bases de Datos 1 aprobada
        previas.push({
            materiaBase: materias[12]._id, // Bases de Datos 2
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'aprobada'
        });

        // SEMESTRE 4
        // Administración de Infraestructura: Redes de Computadoras aprobada y Sistemas Operativos a examen
        previas.push({
            materiaBase: materias[15]._id, // Administración de Infraestructura
            materiaPrevia: materias[10]._id, // Redes de Computadoras
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[15]._id, // Administración de Infraestructura
            materiaPrevia: materias[5]._id, // Sistemas Operativos
            requisito: 'examen'
        });

        // Probabilidad y Estadística: Discreta y Lógica 2 a examen y Discreta y Lógica 1 a examen
        previas.push({
            materiaBase: materias[16]._id, // Probabilidad y Estadística
            materiaPrevia: materias[6]._id, // Discreta y Lógica 2
            requisito: 'examen'
        });
        previas.push({
            materiaBase: materias[16]._id, // Probabilidad y Estadística
            materiaPrevia: materias[1]._id, // Discreta y Lógica 1
            requisito: 'examen'
        });

        // Ingeniería de Software: Estructura de Datos y Algoritmos a examen, Programación Avanzada aprobada, Bases de Datos 1 a examen, Bases de Datos 2 aprobada
        previas.push({
            materiaBase: materias[17]._id, // Ingeniería de Software
            materiaPrevia: materias[7]._id, // Estructura de Datos y Algoritmos
            requisito: 'examen'
        });
        previas.push({
            materiaBase: materias[17]._id, // Ingeniería de Software
            materiaPrevia: materias[11]._id, // Programación Avanzada
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[17]._id, // Ingeniería de Software
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'examen'
        });
        previas.push({
            materiaBase: materias[17]._id, // Ingeniería de Software
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });

        // Programación de Aplicaciones: Programación Avanzada aprobada, Estructura de Datos y Algoritmos a examen, Bases de Datos 2 aprobada, Bases de Datos 1 a examen
        previas.push({
            materiaBase: materias[18]._id, // Programación de Aplicaciones
            materiaPrevia: materias[11]._id, // Programación Avanzada
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[18]._id, // Programación de Aplicaciones
            materiaPrevia: materias[7]._id, // Estructura de Datos y Algoritmos
            requisito: 'examen'
        });
        previas.push({
            materiaBase: materias[18]._id, // Programación de Aplicaciones
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[18]._id, // Programación de Aplicaciones
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'examen'
        });

        // SEMESTRE 5
        // Taller de Aplicaciones de Internet Ricas: Programación de Aplicaciones aprobada
        previas.push({
            materiaBase: materias[20]._id, // Taller de Aplicaciones de Internet Ricas
            materiaPrevia: materias[18]._id, // Programación de Aplicaciones
            requisito: 'aprobada'
        });

        // Taller de Sistemas de Información Java EE: Programación de Aplicaciones aprobada, Bases de Datos 1 aprobada y Bases de Datos 2 aprobada
        previas.push({
            materiaBase: materias[21]._id, // Taller de Sistemas de Información Java EE
            materiaPrevia: materias[18]._id, // Programación de Aplicaciones
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[21]._id, // Taller de Sistemas de Información Java EE
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[21]._id, // Taller de Sistemas de Información Java EE
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });

        // Administración de Infraestructuras 2: Arquitectura aprobada, Sistemas Operativos aprobada, Redes de Computadoras aprobada, Administración de Infraestructuras aprobada
        previas.push({
            materiaBase: materias[22]._id, // Administración de Infraestructuras 2
            materiaPrevia: materias[0]._id, // Arquitectura
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[22]._id, // Administración de Infraestructuras 2
            materiaPrevia: materias[5]._id, // Sistemas Operativos
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[22]._id, // Administración de Infraestructuras 2
            materiaPrevia: materias[10]._id, // Redes de Computadoras
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[22]._id, // Administración de Infraestructuras 2
            materiaPrevia: materias[15]._id, // Administración de Infraestructura
            requisito: 'aprobada'
        });

        // Pasantía Laboral: todas las materias especificadas aprobadas
        const materiasParaPasantia = [2, 7, 11, 0, 5, 10, 8, 12]; // índices de las materias requeridas
        materiasParaPasantia.forEach(indice => {
            previas.push({
                materiaBase: materias[23]._id, // Pasantía Laboral
                materiaPrevia: materias[indice]._id,
                requisito: 'aprobada'
            });
        });

        // Taller de Desarrollo de Aplicaciones Web con PHP: Programación de Aplicaciones aprobada, Bases de Datos 1 aprobada, Bases de Datos 2 aprobada
        previas.push({
            materiaBase: materias[24]._id, // Taller de Desarrollo de Aplicaciones Web con PHP
            materiaPrevia: materias[18]._id, // Programación de Aplicaciones
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[24]._id, // Taller de Desarrollo de Aplicaciones Web con PHP
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[24]._id, // Taller de Desarrollo de Aplicaciones Web con PHP
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });

        // Taller de Aplicaciones para Dispositivos Móviles: Programación Avanzada aprobada, Bases de Datos 1 aprobada
        previas.push({
            materiaBase: materias[25]._id, // Taller de Aplicaciones Para Dispositivos Móviles
            materiaPrevia: materias[11]._id, // Programación Avanzada
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[25]._id, // Taller de Aplicaciones Para Dispositivos Móviles
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'aprobada'
        });

        // SEMESTRE 6
        // Sistemas de Gestión de Contenidos: Programación de Aplicaciones aprobada, Taller de Aplicaciones de Internet Ricas aprobada
        previas.push({
            materiaBase: materias[26]._id, // Sistemas de Gestión de Contenidos
            materiaPrevia: materias[18]._id, // Programación de Aplicaciones
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[26]._id, // Sistemas de Gestión de Contenidos
            materiaPrevia: materias[20]._id, // Taller de Aplicaciones de Internet Ricas
            requisito: 'aprobada'
        });

        // Taller de Sistemas de Información .NET: Programación de Aplicaciones aprobada, Bases de Datos 1 aprobada, Bases de Datos 2 aprobada
        previas.push({
            materiaBase: materias[27]._id, // Taller de Sistemas de Información .NET
            materiaPrevia: materias[18]._id, // Programación de Aplicaciones
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[27]._id, // Taller de Sistemas de Información .NET
            materiaPrevia: materias[8]._id, // Bases de Datos 1
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[27]._id, // Taller de Sistemas de Información .NET
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });

        // Introducción a los Sistemas de Control: Arquitectura aprobada, Sistemas Operativos aprobada, Redes de Computadoras aprobada, Administración de Infraestructuras aprobada
        previas.push({
            materiaBase: materias[28]._id, // Introducción a los Sistemas de Control
            materiaPrevia: materias[0]._id, // Arquitectura
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[28]._id, // Introducción a los Sistemas de Control
            materiaPrevia: materias[5]._id, // Sistemas Operativos
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[28]._id, // Introducción a los Sistemas de Control
            materiaPrevia: materias[10]._id, // Redes de Computadoras
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[28]._id, // Introducción a los Sistemas de Control
            materiaPrevia: materias[15]._id, // Administración de Infraestructura
            requisito: 'aprobada'
        });

        // Proyecto Final: todas las materias del semestre 1 al 4 aprobadas
        const materiasSem1a4 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
        materiasSem1a4.forEach(indice => {
            previas.push({
                materiaBase: materias[29]._id, // Proyecto Final
                materiaPrevia: materias[indice]._id,
                requisito: 'aprobada'
            });
        });

        // Introducción al Desarrollo de Juegos: Programación Avanzada aprobada, Matemática Discreta y Lógica 2 aprobada, Bases de Datos 2 aprobada
        previas.push({
            materiaBase: materias[31]._id, // Introducción al Desarrollo de Juegos
            materiaPrevia: materias[11]._id, // Programación Avanzada
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[31]._id, // Introducción al Desarrollo de Juegos
            materiaPrevia: materias[6]._id, // Discreta y Lógica 2
            requisito: 'aprobada'
        });
        previas.push({
            materiaBase: materias[31]._id, // Introducción al Desarrollo de Juegos
            materiaPrevia: materias[12]._id, // Bases de Datos 2
            requisito: 'aprobada'
        });

        // Crear todas las previas
        const previasCreadas = await Previa.create(previas);

        console.log('Previas creadas:', previasCreadas.length);

        // Crear cursadas (estudiantes cursando materias)
        const cursadas = await Cursa.create([
            // Estudiante 1
            {
                usuario: usuarios[2]._id, // estudiante1
                materia: materias[0]._id, // Arquitectura
                estado: 'aprobada'
            },
            {
                usuario: usuarios[2]._id, // estudiante1
                materia: materias[1]._id, // Discreta y Lógica 1
                estado: 'aprobada'
            },
            {
                usuario: usuarios[2]._id, // estudiante1
                materia: materias[2]._id, // Principios de Programación
                estado: 'en_curso'
            },

            // Estudiante 2
            {
                usuario: usuarios[3]._id, // estudiante2
                materia: materias[0]._id, // Arquitectura
                estado: 'en_curso'
            },
            {
                usuario: usuarios[3]._id, // estudiante2
                materia: materias[1]._id, // Discreta y Lógica 1
                estado: 'en_curso'
            },

            // Estudiante 3
            {
                usuario: usuarios[4]._id, // estudiante3
                materia: materias[0]._id, // Arquitectura
                estado: 'aprobada'
            },
            {
                usuario: usuarios[4]._id, // estudiante3
                materia: materias[1]._id, // Discreta y Lógica 1
                estado: 'aprobada'
            },
            {
                usuario: usuarios[4]._id, // estudiante3
                materia: materias[2]._id, // Principios de Programación
                estado: 'pendiente'
            },
            {
                usuario: usuarios[4]._id, // estudiante3
                materia: materias[3]._id, // Matemática
                estado: 'examen'
            }
        ]);

        console.log('Cursadas creadas:', cursadas.length);

        // 5. Crear notificaciones
        const notificaciones = await Notificacion.create([
            {
                usuario: usuarios[2]._id, // estudiante1
                tipo: 'nuevaMateria',
                mensaje: 'Nueva materia disponible: Principios de Programación',
                data: { materiaId: materias[2]._id, materiaNombre: 'Principios de Programación' },
                leido: false
            },
            {
                usuario: usuarios[2]._id, // estudiante1
                tipo: 'nuevaMateria',
                mensaje: 'Nueva materia disponible: Arquitectura',
                data: { materiaId: materias[0]._id, materiaNombre: 'Arquitectura', nota: 8 },
                leido: true
            },
            {
                usuario: usuarios[3]._id, // estudiante2
                tipo: 'nuevaMateria',
                mensaje: 'Nueva materia disponible: Discreta y Lógica 1',
                data: { materiaId: materias[1]._id, materiaNombre: 'Discreta y Lógica 1', fecha: '2024-03-15' },
                leido: false
            },
            {
                usuario: usuarios[1]._id, // admin2
                tipo: 'nuevaMateria',
                mensaje: 'Nueva materia disponible: Arquitectura',
                data: { materiaId: materias[0]._id, materiaNombre: 'Arquitectura' },
                leido: true
            }
        ]);

        console.log('Notificaciones creadas:', notificaciones.length);

        // Mostrar resumen
        console.log('\n=== RESUMEN DEL SEED ===');
        console.log(`✅ Usuarios: ${usuarios.length}`);
        console.log(`✅ Materias: ${materias.length}`);
        console.log(`✅ Previas: ${previasCreadas.length}`);
        console.log(`✅ Cursadas: ${cursadas.length}`);
        console.log(`✅ Notificaciones: ${notificaciones.length}`);

        console.log('\n=== USUARIOS CREADOS ===');
        usuarios.forEach(user => {
            console.log(`${user.rol}: ${user.username} (${user.email})`);
        });

        console.log('\n=== MATERIAS CREADAS ===');
        materias.forEach(materia => {
            console.log(`[${materia.codigo}] ${materia.nombre} - ${materia.creditos} créditos - ${materia.semestre}`);
        });

    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
    } finally {
        // Cerrar conexión
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada');
        process.exit(0);
    }
}

// Ejecutar el seed
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;