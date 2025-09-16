let cy;
let nodoSeleccionado = null;
let selectedMaterias = new Set(); // Materias agregadas al horario
let conflicts = new Map(); // Conflictos de horario

// Función para obtener el color del nodo según el historial
function getNodeColor(materiaId) {
    const registro = historialData.find(h => h.materia === materiaId);
    if (!registro) {
        return 'rgba(164, 170, 170, 1)'; // Gris para pendiente
    }

    switch (registro.estado) {
        case 'aprobada':
            return 'rgba(76, 175, 80, 1)'; // Verde
        case 'examen':
            return 'rgba(255, 152, 0, 1)'; // Naranja
        default:
            return 'rgba(164, 170, 170, 1)'; // Gris por defecto
    }
}

// Función para obtener el color del texto
function getTextColor(materiaId) {
    const registro = historialData.find(h => h.materia === materiaId);
    if (registro && (registro.estado === 'aprobada' || registro.estado === 'examen')) {
        return '#fff'; // Texto blanco para fondos de color
    }
    return '#000'; // Texto negro para fondo gris
}

// Función para obtener información completa de una materia
function getMateriaInfo(materiaId) {
    const materia = materiasRaw.find(m => m._id === materiaId);
    const registro = historialData.find(h => h.materia === materiaId);

    if (!materia) return null;

    return {
        id: materiaId,
        nombre: materia.nombre,
        semestre: materia.semestre,
        creditos: materia.creditos || 'No especificado',
        estado: registro ? registro.estado : 'pendiente',
        horarios: materia.horarios || 'No especificado'
    };
}

// Función para obtener solo los prerequisitos (nodos previos)
function getPrerequisites(materiaId) {
    const prerequisites = [];

    // Solo prerequisitos (materias que esta materia necesita)
    const prereqs = previasData.filter(previa => previa.data.target === materiaId);
    prereqs.forEach(prereq => {
        prerequisites.push({
            from: prereq.data.source,
            to: prereq.data.target,
            type: prereq.data.tipo,
            edgeId: prereq.data.id
        });
    });

    return prerequisites;
}

// Función para resaltar solo conexiones hacia atrás (prerequisitos)
function highlightPrerequisites(materiaId) {
    if (!materiaId) {
        // Si no hay selección, mostrar todo normal y restaurar bordes
        cy.nodes().style({
            'opacity': 1,
            'border-width': 2,
            'border-color': function (ele) {
                const registro = historialData.find(h => h.materia === ele.id());
                if (registro && registro.estado === 'aprobada') {
                    return 'rgba(56, 142, 60, 1)';
                } else if (registro && registro.estado === 'examen') {
                    return 'rgba(245, 124, 0, 1)';
                }
                return '#333';
            }
        });
        cy.edges().style({
            'opacity': 1
        });
        return [];
    }

    const prerequisites = getPrerequisites(materiaId);

    // Obtener todos los nodos y aristas de prerequisitos
    const connectedNodes = new Set([materiaId]);
    const connectedEdges = new Set();

    prerequisites.forEach(conn => {
        connectedNodes.add(conn.from);
        connectedEdges.add(conn.edgeId);
    });

    // Primero restaurar todos los bordes a su estado normal
    cy.nodes().style({
        'opacity': 0.3,
        'border-width': 2,
        'border-color': function (ele) {
            const registro = historialData.find(h => h.materia === ele.id());
            if (registro && registro.estado === 'aprobada') {
                return 'rgba(56, 142, 60, 1)';
            } else if (registro && registro.estado === 'examen') {
                return 'rgba(245, 124, 0, 1)';
            }
            return '#333';
        }
    });

    cy.edges().style({
        'opacity': 0.2
    });

    // Resaltar nodos conectados
    connectedNodes.forEach(nodeId => {
        cy.getElementById(nodeId).style({
            'opacity': 1
        });
    });

    // Resaltar aristas conectadas
    connectedEdges.forEach(edgeId => {
        cy.getElementById(edgeId).style({
            'opacity': 1
        });
    });

    // Resaltar especialmente el nodo seleccionado (solo este debe tener borde amarillo)
    cy.getElementById(materiaId).style({
        'border-width': 4,
        'border-color': '#FFD700',
        'opacity': 1
    });

    return prerequisites;
}

// Función para verificar si una materia se puede matricular
function canEnrollInSubject(materiaId) {
    // Si la materia ya está aprobada, no se puede matricular
    const registro = historialData.find(h => h.materia === materiaId);
    if (registro && registro.estado === 'aprobada') {
        return {
            canEnroll: false,
            reason: 'La materia ya está aprobada'
        };
    }

    // Si ya está inscrita (estado examen), no se puede matricular nuevamente
    if (registro && registro.estado === 'examen') {
        return {
            canEnroll: false,
            reason: 'Ya estás inscrito a examen en esta materia'
        };
    }

    // Verificar prerequisitos
    const prerequisites = getPrerequisites(materiaId);
    const unmetPrerequisites = [];

    prerequisites.forEach(prereq => {
        const prereqRecord = historialData.find(h => h.materia === prereq.from);

        if (!prereqRecord) {
            // No tiene registro, está pendiente
            const prereqMateria = materiasRaw.find(m => m._id === prereq.from);
            unmetPrerequisites.push({
                nombre: prereqMateria?.nombre || prereq.from,
                required: prereq.type,
                current: 'pendiente'
            });
        } else if (prereq.type === 'aprobada' && prereqRecord.estado !== 'aprobada') {
            // Requiere aprobada pero no está aprobada
            const prereqMateria = materiasRaw.find(m => m._id === prereq.from);
            unmetPrerequisites.push({
                nombre: prereqMateria?.nombre || prereq.from,
                required: 'aprobada',
                current: prereqRecord.estado
            });
        }
        // Si requiere 'examen' y tiene 'examen' o 'aprobada', está OK
        // Si requiere 'aprobada' y tiene 'aprobada', está OK
    });

    if (unmetPrerequisites.length > 0) {
        let reason = 'No cumples con las siguientes previas:\n';
        unmetPrerequisites.forEach(unmet => {
            const requiredText = unmet.required === 'aprobada' ? 'estar aprobada' : 'estar en examen';
            const currentText = (unmet.current === 'pendiente' || unmet.current === 'en_curso')
                ? 'pendiente'
                : unmet.current;
            reason += `• ${unmet.nombre}: requiere ${requiredText}\nEstado actual de ${unmet.nombre}: ${currentText}\n`;
        });

        return {
            canEnroll: false,
            reason: reason.trim()
        };
    }

    return {
        canEnroll: true,
        reason: 'Puedes matricularte a esta materia'
    };
}

// Función para parsear tiempo a minutos
function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Función para convertir minutos a formato de hora
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Función para obtener las horas que ocupa un horario
function getOccupiedHours(horario) {
    let startMinutes = parseTime(horario.horaInicio);
    let endMinutes = parseTime(horario.horaFin);

    // Tratar 00:00 como 24:00 (medianoche del mismo día)
    if (endMinutes === 0) {
        endMinutes = 24 * 60;
    }

    const startHour = Math.floor(startMinutes / 60);
    const endHour = Math.floor((endMinutes - 1) / 60);

    const occupiedHours = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        occupiedHours.push(hour);
    }

    return occupiedHours;
}


// Función para detectar conflictos de horario
function detectScheduleConflicts(newMateriaId) {
    const newMateria = materiasRaw.find(m => m._id === newMateriaId);
    if (!newMateria || !newMateria.horarios) return [];

    const conflicts = [];

    selectedMaterias.forEach(existingMateriaId => {
        const existingMateria = materiasRaw.find(m => m._id === existingMateriaId);
        if (!existingMateria || !existingMateria.horarios) return;

        newMateria.horarios.forEach(newHorario => {
            existingMateria.horarios.forEach(existingHorario => {
                if (newHorario.dia === existingHorario.dia) {
                    const newHours = getOccupiedHours(newHorario);
                    const existingHours = getOccupiedHours(existingHorario);

                    const conflictingHours = newHours.filter(hour => existingHours.includes(hour));

                    if (conflictingHours.length > 0) {
                        conflicts.push({
                            dia: newHorario.dia,
                            newMateria: newMateria.nombre,
                            existingMateria: existingMateria.nombre,
                            newHorario: `${newHorario.horaInicio}-${newHorario.horaFin}`,
                            existingHorario: `${existingHorario.horaInicio}-${existingHorario.horaFin}`,
                            conflictingHours: conflictingHours
                        });
                    }
                }
            });
        });
    });

    return conflicts;
}

// Función para agregar materia al horario
function addToSchedule(materiaId) {
    selectedMaterias.add(materiaId);
    updateScheduleTable();
    updateInfoPanel();
}


// Función para remover materia del horario
function removeFromSchedule(materiaId) {
    selectedMaterias.delete(materiaId);
    updateScheduleTable();
    updateInfoPanel();
}

// Función para actualizar el panel de información cuando cambia el horario
function updateInfoPanel() {
    if (nodoSeleccionado) {
        const materiaInfo = getMateriaInfo(nodoSeleccionado);
        const prerequisites = getPrerequisites(nodoSeleccionado);
        if (materiaInfo) {
            showInfoPanel(materiaInfo, prerequisites);
        }
    }
}

// Función para actualizar la tabla de horarios
function updateScheduleTable() {
    const tbody = document.getElementById('schedule-body');
    const conflictMessages = document.getElementById('conflict-messages');
    tbody.innerHTML = '';
    conflictMessages.innerHTML = '';

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Determinar rango dinámico de horas basado en las materias seleccionadas
    let minHour = 24;
    let maxHour = 0;

    selectedMaterias.forEach(materiaId => {
        const materia = materiasRaw.find(m => m._id === materiaId);
        if (!materia || !materia.horarios) return;

        materia.horarios.forEach(horario => {
            const occupiedHours = getOccupiedHours(horario);
            if (occupiedHours.length > 0) {
                minHour = Math.min(minHour, Math.min(...occupiedHours));
                maxHour = Math.max(maxHour, Math.max(...occupiedHours));
            }
        });
    });

    // Si no hay materias seleccionadas, mostrar horario básico
    if (selectedMaterias.size === 0) {
        minHour = 18;
        maxHour = 23;
    }

    // Crear array de horas a mostrar
    const hours = [];
    for (let hour = minHour; hour <= maxHour; hour++) {
        hours.push(hour);
    }

    // Crear mapa de materias por horario y detectar conflictos
    const scheduleMap = new Map();
    const conflictMap = new Map();
    const allConflicts = [];

    selectedMaterias.forEach(materiaId => {
        const materia = materiasRaw.find(m => m._id === materiaId);
        if (!materia || !materia.horarios) return;

        materia.horarios.forEach(horario => {
            const occupiedHours = getOccupiedHours(horario);

            occupiedHours.forEach(hour => {
                const key = `${horario.dia}-${hour}`;

                if (!scheduleMap.has(key)) {
                    scheduleMap.set(key, []);
                }
                scheduleMap.get(key).push({
                    nombre: materia.nombre,
                    horarioOriginal: `${horario.horaInicio}-${horario.horaFin}`
                });

                // Si ya hay más de una materia en esta hora/día, es un conflicto
                if (scheduleMap.get(key).length > 1) {
                    conflictMap.set(key, true);
                }
            });
        });
    });

    // Generar lista de conflictos para mostrar arriba
    conflictMap.forEach((isConflict, key) => {
        if (isConflict) {
            const [dia, hour] = key.split('-');
            const materias = scheduleMap.get(key);
            if (materias && materias.length > 1) {
                allConflicts.push({
                    dia: dia,
                    hora: `${hour}:00`,
                    materias: materias
                });
            }
        }
    });

    // Mostrar mensajes de conflicto
    if (allConflicts.length > 0) {
        const conflictDiv = document.createElement('div');
        conflictDiv.className = 'conflict-message';
        conflictDiv.innerHTML = `
            <strong>⚠ CONFLICTOS DE HORARIO DETECTADOS:</strong><br>
            ${allConflicts.map(c =>
            `${c.dia} ${c.hora}: ${c.materias.map(m => `${m.nombre} (${m.horarioOriginal})`).join(' ↔ ')}`
        ).join('<br>')}
        `;
        conflictMessages.appendChild(conflictDiv);
    }

    // Generar tabla
    hours.forEach(hour => {
        const row = document.createElement('tr');

        // Columna de hora
        const timeCell = document.createElement('td');
        timeCell.className = 'time-slot';
        timeCell.textContent = `${hour.toString().padStart(2, '0')}:00`;
        row.appendChild(timeCell);

        // Columnas de días
        days.forEach(day => {
            const dayCell = document.createElement('td');
            const key = `${day}-${hour}`;
            if (scheduleMap.has(key)) {
                const materias = scheduleMap.get(key);
                dayCell.className = 'materia-slot';

                // Si hay conflicto, agregar clase de conflicto
                if (conflictMap.has(key)) {
                    dayCell.className += ' conflict-slot';
                }

                if (materias.length > 1) {
                    dayCell.textContent = materias.map(m => m.nombre).join(' / ');
                    dayCell.title = `Conflicto: ${materias.map(m => `${m.nombre} (${m.horarioOriginal})`).join(' y ')}`;
                } else {
                    dayCell.textContent = materias[0].nombre;
                    dayCell.title = `${materias[0].nombre} (${materias[0].horarioOriginal})`;
                }
            }
            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });
}

// Función para mostrar el panel de información
function showInfoPanel(materiaInfo, prerequisites) {
    const content = document.getElementById('panel-content');

    let horariosHTML = '';
    if (typeof materiaInfo.horarios === 'string') {
        horariosHTML = materiaInfo.horarios;
    } else if (Array.isArray(materiaInfo.horarios)) {
        horariosHTML = materiaInfo.horarios.map(h =>
            `${h.dia} ${h.horaInicio}-${h.horaFin}`
        ).join('<br>');
    }

    let prerequisitosHTML = '';

    if (prerequisites.length > 0) {
        prerequisitosHTML = '<h4>Previas:</h4><ul>';
        prerequisites.forEach(conn => {
            const fromMateria = materiasRaw.find(m => m._id === conn.from);
            const tipoText = conn.type === 'aprobada' ? 'Aprobada' : 'A examen';
            prerequisitosHTML += `<li>${fromMateria?.nombre || conn.from} <span class="req-type">(${tipoText})</span></li>`;
        });
        prerequisitosHTML += '</ul>';
    } else {
        prerequisitosHTML = '<p><em>Esta materia no tiene previas</em></p>';
    }

    // Verificar si se puede matricular a la materia
    const enrollmentStatus = canEnrollInSubject(materiaInfo.id);

    // Botón para agregar/quitar del horario
    const isInSchedule = selectedMaterias.has(materiaInfo.id);
    const canAddToSchedule = enrollmentStatus.canEnroll || isInSchedule;

    let scheduleButtonHTML = '';
    if (canAddToSchedule) {
        if (isInSchedule) {
            scheduleButtonHTML = `
                <button id="schedule-btn" class="add-to-schedule-btn remove-from-schedule-btn" onclick="removeFromSchedule('${materiaInfo.id}')">
                    Quitar de Mi Horario
                </button>
            `;
        } else {
            scheduleButtonHTML = `
                <button id="schedule-btn" class="add-to-schedule-btn" onclick="addToSchedule('${materiaInfo.id}')">
                    Agregar a Mi Horario
                </button>
            `;
        }
    } else {
        scheduleButtonHTML = `
            <button id="schedule-btn" class="add-to-schedule-btn" disabled>
                No se puede agregar
            </button>
        `;
    }

    // HTML para el estado de anotación
    let enrollmentHTML = '<div class="enrollment-status">';
    if (enrollmentStatus.canEnroll) {
        enrollmentHTML += `
            <div class="enrollment-success">
                <strong>✓ ${enrollmentStatus.reason}</strong>
            </div>
        `;
    } else {
        enrollmentHTML += `
            <div class="enrollment-warning">
                <strong>⚠ No se puede matricular:</strong>
                <div class="enrollment-reasons">${enrollmentStatus.reason.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }
    enrollmentHTML += '</div>';


    const estadoColor = {
        'aprobada': '#4CAF50',
        'examen': '#FF9800',
        'pendiente': '#9E9E9E'
    }[materiaInfo.estado] || '#9E9E9E';

    content.innerHTML = `
        <div class="materia-header">
            <h3>${materiaInfo.nombre}</h3>
            <span class="estado-badge" style="background-color: ${estadoColor}">
                ${(materiaInfo.estado === 'en_curso' ? 'pendiente' : materiaInfo.estado).toUpperCase()}
            </span>
        </div>
        <div class="materia-details">
            <p><strong>Semestre:</strong> ${materiaInfo.semestre}</p>
            <p><strong>Créditos:</strong> ${materiaInfo.creditos}</p>
            <p><strong>Horarios:</strong><br>${horariosHTML}</p>
        </div>
        ${scheduleButtonHTML}
        ${prerequisitosHTML}
        ${enrollmentHTML}
    `;
}

// Función para ocultar el panel de información
function hideInfoPanel() {
    const content = document.getElementById('panel-content');
    // Mostrar mensaje por defecto
    content.innerHTML = `
        <p style="color: #666; text-align: center; margin-top: 50px;">
            <em>Haz clic en una materia para ver su información</em>
        </p>
    `;
    // Restaurar opacidad normal y quitar resaltados
    highlightPrerequisites(null);
    nodoSeleccionado = null;
}

// Función para actualizar posiciones de títulos y líneas según el zoom
function updateSemesterLayout() {
    const container = document.getElementById('cy');
    const zoom = cy.zoom();
    const pan = cy.pan();

    const containerWidth = container.offsetWidth || 1000;
    const semestres = [...new Set(materiasRaw.map(m => m.semestre))].sort((a, b) => {
        const numA = parseInt(a.replace("Semestre ", ""));
        const numB = parseInt(b.replace("Semestre ", ""));
        return numA - numB;
    });
    const maxSemestre = semestres.length;
    const columnWidth = containerWidth / maxSemestre;

    // Actualizar títulos
    const titulos = container.querySelectorAll('.semester-title');
    titulos.forEach((titulo, index) => {
        const x = (index * columnWidth + columnWidth / 2 - 40) * zoom + pan.x;
        const y = 10 * zoom + pan.y;
        titulo.style.left = x + 'px';
        titulo.style.top = y + 'px';
        titulo.style.fontSize = (14 * zoom) + 'px';
    });

    // Actualizar líneas
    const lineas = container.querySelectorAll('.semester-line');
    lineas.forEach((linea, index) => {
        const x = ((index + 1) * columnWidth) * zoom + pan.x;
        linea.style.left = x + 'px';
        linea.style.top = (0 * zoom + pan.y) + 'px';
        linea.style.height = '100%';
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Crear panel de información
    const container = document.getElementById('cy');

    // Inicializar tabla de horarios
    updateScheduleTable();

    cy = cytoscape({
        container: container,
        elements: {
            nodes: materiasData,
            edges: previasData
        },
        style: [
            {
                selector: 'node',
                style: {
                    'shape': 'round-rectangle',
                    'background-color': function (ele) {
                        return getNodeColor(ele.id());
                    },
                    'label': 'data(label)',
                    'color': function (ele) {
                        return getTextColor(ele.id());
                    },
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '12px',
                    'font-weight': '500',
                    'width': 'label',
                    'padding': '10px',
                    'border-width': 2,
                    'border-color': function (ele) {
                        const registro = historialData.find(h => h.materia === ele.id());
                        if (registro && registro.estado === 'aprobada') {
                            return 'rgba(56, 142, 60, 1)';
                        } else if (registro && registro.estado === 'examen') {
                            return 'rgba(245, 124, 0, 1)';
                        }
                        return '#333';
                    },
                    'text-wrap': 'wrap',
                    'text-max-width': '120px'
                }
            },
            {
                selector: 'edge[tipo="aprobada"]',
                style: {
                    'width': 2,
                    'line-color': 'rgba(76, 175, 80, 1)',
                    'curve-style': 'unbundled-bezier',
                    'target-arrow-color': 'rgba(76, 175, 80, 1)',
                    'target-arrow-shape': 'vee',
                    'arrow-scale': 1.2,
                    'events': 'no'
                }
            },
            {
                selector: 'edge[tipo="examen"]',
                style: {
                    'width': 2,
                    'line-color': 'rgba(255, 152, 0, 1)',
                    'line-style': 'dashed',
                    'line-dash-pattern': [3, 5], // punto pequeño, espacio grande
                    'curve-style': 'unbundled-bezier',
                    'target-arrow-color': 'rgba(255, 152, 0, 1)',
                    'target-arrow-shape': 'vee',
                    'arrow-scale': 1.2,
                    'events': 'no'
                }
            }
        ],
        layout: {
            name: 'preset',
            animate: true,
            positions: function (node) {
                const materia = materiasRaw.find(m => m._id === node.id());
                const semestreStr = materia ? materia.semestre : "Semestre 1";

                const materiasDelSemestre = materiasRaw.filter(m => m.semestre === semestreStr);
                const indexEnSemestre = materiasDelSemestre.findIndex(m => m._id === node.id());

                const containerWidth = container.offsetWidth || 1000;
                const semestresUnicos = [...new Set(materiasRaw.map(m => m.semestre))].sort((a, b) => {
                    const numA = parseInt(a.replace("Semestre ", ""));
                    const numB = parseInt(b.replace("Semestre ", ""));
                    return numA - numB;
                });
                const maxSemestre = semestresUnicos.length;
                const columnWidth = containerWidth / maxSemestre;
                const semestreIndex = semestresUnicos.indexOf(semestreStr);

                const x = (semestreIndex + 0.5) * columnWidth;
                const y = (indexEnSemestre + 1) * 80 + 40;

                return { x: x, y: y };
            }
        },
        // Deshabilitar movimiento y selección de nodos
        autoungrabify: true,  // Los nodos no se pueden mover
        autounselectify: false,  // Mantener la capacidad de seleccionar
        boxSelectionEnabled: false,  // Deshabilitar selección de caja
        userZoomingEnabled: true,  // Mantener zoom
        userPanningEnabled: true   // Mantener paneo
    });

    // Crear títulos de semestre y líneas divisorias
    const containerWidth = container.offsetWidth || 1000;
    const semestres = [...new Set(materiasRaw.map(m => m.semestre))].sort((a, b) => {
        const numA = parseInt(a.replace("Semestre ", ""));
        const numB = parseInt(b.replace("Semestre ", ""));
        return numA - numB;
    });
    const maxSemestre = semestres.length;
    const columnWidth = containerWidth / maxSemestre;

    semestres.forEach((semestre, index) => {
        const titulo = document.createElement('div');
        titulo.textContent = semestre;
        titulo.className = 'semester-title';  // Añadimos clase para identificación
        titulo.style.position = 'absolute';
        titulo.style.left = (index * columnWidth + columnWidth / 2 - 40) + 'px';
        titulo.style.top = '10px';
        titulo.style.fontWeight = 'bold';
        titulo.style.fontSize = '14px';
        titulo.style.color = '#333';
        titulo.style.zIndex = '10';
        titulo.style.pointerEvents = 'none';
        titulo.style.transformOrigin = 'center';  // Para que el zoom sea desde el centro
        container.appendChild(titulo);

        if (index < semestres.length - 1) {
            const linea = document.createElement('div');
            linea.className = 'semester-line';  // Añadimos clase para identificación
            linea.style.position = 'absolute';
            linea.style.left = ((index + 1) * columnWidth) + 'px';
            linea.style.top = '0px';
            linea.style.width = '1px';
            linea.style.height = '100%';
            linea.style.backgroundColor = '#ddd';
            linea.style.zIndex = '9';
            linea.style.pointerEvents = 'none';
            container.appendChild(linea);
        }
    });

    // Event listeners
    cy.on('tap', 'node', function (evt) {
        const node = evt.target;
        const materiaId = node.id();

        // Si es el mismo nodo, deseleccionar
        if (nodoSeleccionado === materiaId) {
            hideInfoPanel();
            return;
        }

        nodoSeleccionado = materiaId;
        const materiaInfo = getMateriaInfo(materiaId);
        const prerequisites = highlightPrerequisites(materiaId);

        if (materiaInfo) {
            showInfoPanel(materiaInfo, prerequisites);
        }
    });

    // Cerrar panel al hacer click fuera del grafo
    cy.on('tap', function (evt) {
        if (evt.target === cy) {
            hideInfoPanel();
        }
    });

    // Listener para actualizar layout con zoom/pan
    cy.on('zoom pan', updateSemesterLayout);

    // Actualizar layout inicial
    updateSemesterLayout();
});