// Variables globales
let currentEditingUserId = null;
let currentDeletingUserId = null;
let currentSearchTerm = '';
let userAuthId = null; // Agregar esta variable global
let currentStudentId = null;
let currentStudentName = '';
let todasLasMaterias = [];
let historialEstudianteActual = [];

async function cargarTodasLasMaterias() {
    try {
        const response = await fetch('/admin/getAllMaterias', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        if (data.success) {
            todasLasMaterias = data.materias;
            actualizarSelectMaterias();
        }
    } catch (error) {
        console.error('Error al cargar materias:', error);
    }
}

function actualizarSelectMaterias(materiasDisponibles = todasLasMaterias) {
    const select = document.getElementById('selectMateriaHistorial');
    select.innerHTML = '<option value="">Seleccionar materia...</option>';

    materiasDisponibles.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia._id;
        option.textContent = `${materia.nombre} (${materia.semestre})`;
        select.appendChild(option);
    });

    // Si no hay materias disponibles, mostrar mensaje
    if (materiasDisponibles.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No hay materias disponibles para agregar';
        option.disabled = true;
        select.appendChild(option);
    }
}

function filtrarMateriasDisponibles() {
    if (!historialEstudianteActual || historialEstudianteActual.length === 0) {
        return todasLasMaterias;
    }

    // Obtener IDs de materias que ya están en el historial
    const materiasEnHistorial = historialEstudianteActual.map(item => item.materia._id);

    // Filtrar materias que NO están en el historial
    const materiasDisponibles = todasLasMaterias.filter(materia => 
        !materiasEnHistorial.includes(materia._id)
    );

    return materiasDisponibles;
}

async function showHistorialModal(userId, username) {
    currentStudentId = userId;
    currentStudentName = username;

    await cargarTodasLasMaterias();

    // Actualizar título con nombre del estudiante
    document.getElementById('studentName').textContent = `${username}`;

    // Limpiar formulario
    document.getElementById('historialForm').reset();

    // Limpiar errores previos
    document.querySelectorAll('#historialModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#historialModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });

    // Cargar historial existente
    await cargarHistorialEstudiante(userId);

    // Filtrar y actualizar el select de materias
    const materiasDisponibles = filtrarMateriasDisponibles();
    actualizarSelectMaterias(materiasDisponibles);

    // Mostrar modal
    document.getElementById('historialModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal de historial
function closeHistorialModal() {
    document.getElementById('historialModal').classList.remove('show');
    document.body.style.overflow = '';
    currentStudentId = null;
    currentStudentName = '';
    historialEstudianteActual = []; // Limpiar el historial actual

    // Limpiar formulario
    document.getElementById('historialForm').reset();

    // Limpiar errores
    document.querySelectorAll('#historialModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#historialModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Función para cargar el historial del estudiante
async function cargarHistorialEstudiante(userId) {
    try {
        const historialContent = document.getElementById('historialContent');

        // Mostrar loading
        historialContent.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 10px;">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                    <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
                </svg>
                Cargando historial...
            </div>
        `;

        const response = await fetch(`/admin/historial/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success && data.historial && data.historial.length > 0) {
            // Almacenar el historial actual
            historialEstudianteActual = data.historial;

            // Mostrar historial
            let historialHTML = '';
            data.historial.forEach((item) => {
                const estadoClass = getEstadoClass(item.estado);
                historialHTML += `
                    <div class="historial-item">
                        <div class="historial-item-content">
                            <div class="historial-materia">${item.materia.nombre}</div>
                            <div class="historial-estado">
                                <span class="estado-badge ${estadoClass}">
                                ${item.estado === "en_curso" ? "en curso" : item.estado}
                                </span>
                            </div>
                        </div>
                        <div class="historial-actions">
                            <button class="btn-icon btn-danger" onclick="eliminarMateriaHistorial('${item._id}', '${item.materia.nombre}')" title="Eliminar">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });
            historialContent.innerHTML = historialHTML;
        } else {
            // Sin historial - limpiar el array
            historialEstudianteActual = [];
            
            // Sin historial
            historialContent.innerHTML = `
                <div class="empty-historial">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 16px; opacity: 0.5;">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p style="margin: 0; color: #6b7280; text-align: center;">No hay materias en el historial</p>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: #9ca3af; text-align: center;">Agrega la primera materia usando el formulario</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error al cargar historial:', error);
        // En caso de error, limpiar el historial
        historialEstudianteActual = [];
        
        document.getElementById('historialContent').innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ef4444;">
                Error al cargar el historial. Intenta nuevamente.
            </div>
        `;
    }
}

// Función para obtener la clase CSS según el estado
function getEstadoClass(estado) {
    switch (estado) {
        case 'pendiente':
            return 'estado-pendiente';
        case 'en_curso':
            return 'estado-curso';
        case 'aprobada':
            return 'estado-aprobado';
        case 'examen':
            return 'estado-examen';
        default:
            return 'estado-pendiente';
    }
}

async function agregarMateriaHistorial() {
    const materiaSelect = document.getElementById('selectMateriaHistorial');
    const estadoSelect = document.getElementById('selectEstadoHistorial');
    const materiaId = materiaSelect.value;
    const estado = estadoSelect.value;

    if (!materiaId || !estado) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor selecciona una materia y un estado',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f59e0b'
            });
        } else {
            alert('Por favor selecciona una materia y un estado');
        }
        return;
    }

    try {
        const response = await fetch('/admin/agregarHistorial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: currentStudentId,
                materiaId,
                estado
            })
        });

        const data = await response.json();
        if (data.success) {
            // Limpiar formulario
            document.getElementById('historialForm').reset();

            // Recargar historial (esto actualizará historialEstudianteActual)
            await cargarHistorialEstudiante(currentStudentId);

            // Actualizar el select con las materias filtradas
            const materiasDisponibles = filtrarMateriasDisponibles();
            actualizarSelectMaterias(materiasDisponibles);

            // Mostrar mensaje de éxito
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Materia agregada!',
                    text: `${data.nombreMateria} ha sido agregada al historial`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } else {
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'No se pudo agregar la materia',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: ' + (data.error || 'No se pudo agregar la materia'));
            }
        }

    } catch (error) {
        console.error('Error:', error);
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        } else {
            alert('Error de conexión');
        }
    }
}

// Función para eliminar materia del historial
async function eliminarMateriaHistorial(historialId, materiaNombre) {
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '¿Eliminar materia?',
            text: `¿Estás seguro de eliminar "${materiaNombre}" del historial?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;
    } else {
        if (!confirm(`¿Estás seguro de eliminar "${materiaNombre}" del historial?`)) {
            return;
        }
    }

    try {
        const response = await fetch('/admin/eliminarHistorial', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                historialId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Recargar historial (esto actualizará historialEstudianteActual)
            await cargarHistorialEstudiante(currentStudentId);

            // Actualizar el select con las materias filtradas
            const materiasDisponibles = filtrarMateriasDisponibles();
            actualizarSelectMaterias(materiasDisponibles);

            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Materia eliminada!',
                    text: 'La materia ha sido eliminada del historial',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } else {
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'No se pudo eliminar la materia',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: ' + (data.error || 'No se pudo eliminar la materia'));
            }
        }

    } catch (error) {
        console.error('Error:', error);
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        } else {
            alert('Error de conexión');
        }
    }
}

// Función para obtener usuario por ID
async function obtenerUsuarioPorId(userId) {
    try {
        const response = await fetch(`/admin/getUserById/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

async function buscarUsuarios(searchTerm, page = 1) {
    try {
        currentSearchTerm = searchTerm;
        const tableBody = document.getElementById('usersTableBody');

        // Mostrar indicador de carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px;">
                    <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 10px;">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                        <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
                    </svg>
                    Buscando usuarios...
                </td>
            </tr>
        `;

        const response = await fetch(`/admin/buscarUsuarios/${encodeURIComponent(searchTerm)}?page=${page}&limit=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        // Limpiar tabla
        tableBody.innerHTML = '';

        if (data.users && data.users.length > 0) {
            data.users.forEach(user => {
                const row = document.createElement('tr');
                const badgeClass = user.rol === 'Administrador' ? 'badge-admin' : 'badge-student';

                // Verificar si el usuario actual puede ser editado/eliminado
                const actionButtons = userAuthId && user._id !== userAuthId ? `
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="showEditUserModal('${user._id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="showDeleteConfirmModal('${user._id}','${user.username}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Eliminar
                        </button>
                        <button class="btn btn-info btn-sm" onclick="showHistorialModal('${user._id}','${user.username}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <circle cx="12" cy="12" r="9" stroke="currentColor"
                                    stroke-width="2" />
                            </svg>
                            Historial
                        </button>
                    </div>
                ` : '';

                row.innerHTML = `
                    <td>${user.username}</td>
                    <td class="email">${user.email}</td>
                    <td><span class="badge ${badgeClass}">${user.rol}</span></td>
                    <td>${actionButtons}</td>
                `;

                tableBody.appendChild(row);
            });

            // Actualizar paginación para búsqueda
            updateSearchPagination(data);
        } else {
            // No se encontraron resultados
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: #6b7280;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 16px; opacity: 0.5;">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <p style="margin: 0; font-size: 16px; font-weight: 500;">No se encontraron usuarios</p>
                        <p style="margin: 8px 0 0 0; font-size: 14px;">Intenta con otros términos de búsqueda</p>
                    </td>
                </tr>
            `;

            // Ocultar paginación si no hay resultados
            const paginationContainer = document.querySelector('.pagination-container');
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        const tableBody = document.getElementById('usersTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
                    Error al buscar usuarios. Intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const createForm = document.getElementById('userForm');
    const editForm = document.getElementById('editUserForm');

    // Obtener el ID del usuario autenticado del template
    userAuthId = typeof window.userAuthId !== 'undefined' ? window.userAuthId :
        (typeof userAuth !== 'undefined' && userAuth.userInfo ? userAuth.userInfo.id :
            (document.querySelector('script[data-user-id]') ?
                document.querySelector('script[data-user-id]').getAttribute('data-user-id') : null));

    function showError(fieldId, message, isEditForm = false) {
        const formPrefix = isEditForm ? 'edit_' : '';
        const field = document.querySelector(`[name="${formPrefix}${fieldId}"]`).closest('.form-group');
        const errorSpan = document.getElementById(`${formPrefix}${fieldId}Error`);

        if (field) {
            field.classList.remove('success');
            field.classList.add('error');
        }

        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    // Función para crear usuario
    async function createUser(formData) {
        try {
            const response = await fetch('/admin/crearUsuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    rol: formData.get('rol')
                })
            });

            const data = await response.json();

            if (data.success) {

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Usuario creado exitosamente!',
                        text: data.message || 'El usuario se ha guardado correctamente',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#10b981',
                        timer: 4000,
                        timerProgressBar: true,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                    window.location.reload();
                } else {
                    alert('Usuario creado exitosamente');
                    window.location.reload();
                }
            } else {

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error en el registro',
                        text: data.error || 'Ha ocurrido un error al crear el usuario',
                        confirmButtonText: 'Intentar nuevamente',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    alert('Error: ' + (data.error || 'Ha ocurrido un error'));
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Intenta nuevamente.',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error de conexión: No se pudo conectar con el servidor');
            }
        }
    }

    // Función para editar usuario
    async function editUser(formData) {
        try {
            const response = await fetch('/admin/editarUsuario', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: currentEditingUserId,
                    username: formData.get('edit_username'),
                    email: formData.get('edit_email'),
                    rol: formData.get('edit_rol')
                })
            });

            const data = await response.json();

            if (data.success) {

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Usuario actualizado exitosamente!',
                        text: data.message || 'El usuario ha sido actualizado correctamente',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#10b981',
                        timer: 4000,
                        timerProgressBar: true,
                        showClass: {
                            popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOutUp'
                        }
                    });
                    window.location.reload();
                } else {
                    alert('Usuario actualizado exitosamente');
                    window.location.reload();
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar',
                        text: data.error || 'Ha ocurrido un error al actualizar el usuario',
                        confirmButtonText: 'Intentar nuevamente',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    alert('Error: ' + (data.error || 'Ha ocurrido un error'));
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Intenta nuevamente.',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error de conexión: No se pudo conectar con el servidor');
            }
        }
    }

    // Validación formulario crear usuario
    createForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('#userModal .form-group.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('#userModal .gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar username
        const username = document.getElementById('username').value.trim();
        if (!username) {
            showError('username', 'El nombre de usuario es requerido');
            isValid = false;
        } else if (username.length < 3) {
            showError('username', 'El nombre de usuario debe tener al menos 3 caracteres');
            isValid = false;
        }

        // Validar email
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError('email', 'El correo electrónico es requerido');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('email', 'Ingresa un correo electrónico válido');
            isValid = false;
        }

        // Validar password
        const password = document.getElementById('password').value;
        if (!password) {
            showError('password', 'La contraseña es requerida');
            isValid = false;
        } else if (password.length < 6) {
            showError('password', 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }

        const rol = document.getElementById('rol').value;
        if (!rol) {
            showError('rol', 'El rol es requerido');
            isValid = false;
        }

        if (!isValid) {
            const firstError = document.querySelector('#userModal .form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = this.querySelector('#userSubmitBtn');
        const originalText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
            </svg>
            Guardando...
        `;

        try {
            const formData = new FormData(this);
            await createUser(formData);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Validación formulario editar usuario
    editForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('#editUserModal .form-group.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('#editUserModal .gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar username
        const username = document.getElementById('edit_username').value.trim();
        if (!username) {
            showError('username', 'El nombre de usuario es requerido', true);
            isValid = false;
        } else if (username.length < 3) {
            showError('username', 'El nombre de usuario debe tener al menos 3 caracteres', true);
            isValid = false;
        }

        // Validar email
        const email = document.getElementById('edit_email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError('email', 'El correo electrónico es requerido', true);
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('email', 'Ingresa un correo electrónico válido', true);
            isValid = false;
        }

        const rol = document.getElementById('edit_rol').value;
        if (!rol) {
            showError('rol', 'El rol es requerido', true);
            isValid = false;
        }

        if (!isValid) {
            const firstError = document.querySelector('#editUserModal .form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = this.querySelector('#editUserSubmitBtn');
        const originalText = submitButton.textContent;

        submitButton.disabled = true;
        submitButton.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
            </svg>
            Actualizando...
        `;

        try {
            const formData = new FormData(this);
            await editUser(formData);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Event listener para el botón de confirmar eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteUser);

    document.getElementById('historialModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeHistorialModal();
        }
    });
    // Event listeners para cerrar modales al hacer clic en el overlay
    document.getElementById('userModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeUserModal();
        }
    });

    document.getElementById('editUserModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditUserModal();
        }
    });

    document.getElementById('deleteModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeDeleteModal();
        }
    });

    // Event listener para cerrar modales con Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (document.getElementById('userModal').classList.contains('show')) {
                closeUserModal();
            }
            if (document.getElementById('editUserModal').classList.contains('show')) {
                closeEditUserModal();
            }
            if (document.getElementById('deleteModal').classList.contains('show')) {
                closeDeleteModal();
            }
        }
    });
    initializeSearch();
});

// Función para mostrar modal de agregar usuario
function showAddUserModal() {
    document.getElementById('userForm').reset();

    // Limpiar errores previos
    document.querySelectorAll('#userModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#userModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });

    document.getElementById('userModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para mostrar modal de editar usuario
async function showEditUserModal(userId) {
    currentEditingUserId = userId;

    try {
        const user = await obtenerUsuarioPorId(userId);

        if (user && user.success !== false) {
            document.getElementById('edit_username').value = user.username || '';
            document.getElementById('edit_email').value = user.email || '';
            document.getElementById('edit_rol').value = user.rol || '';

            // Limpiar errores previos
            document.querySelectorAll('#editUserModal .form-group.error').forEach(field => {
                field.classList.remove('error');
            });
            document.querySelectorAll('#editUserModal .gentle-error.show').forEach(error => {
                error.classList.remove('show');
            });

            document.getElementById('editUserModal').classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            closeEditUserModal();
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los datos del usuario',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: No se pudieron obtener los datos del usuario');
            }
        }
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        closeEditUserModal();
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        } else {
            alert('Error de conexión');
        }
    }
}

// Función para cerrar modal de crear usuario
function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    document.body.style.overflow = '';

    document.getElementById('userForm').reset();

    // Limpiar errores
    document.querySelectorAll('#userModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#userModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Función para cerrar modal de editar usuario
function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
    document.body.style.overflow = '';
    currentEditingUserId = null;

    document.getElementById('editUserForm').reset();

    // Limpiar errores
    document.querySelectorAll('#editUserModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#editUserModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Función para mostrar modal de confirmación de eliminación
function showDeleteConfirmModal(userId, username) {
    currentDeletingUserId = userId;
    document.getElementById('deleteUserName').textContent = username;
    document.getElementById('deleteModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal de eliminación
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    document.body.style.overflow = '';
    currentDeletingUserId = null;
}

// Función para eliminar usuario
async function deleteUser() {
    if (currentDeletingUserId) {
        try {
            const response = await fetch(`/admin/eliminarUsuario/${currentDeletingUserId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                closeDeleteModal();

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Usuario eliminado!',
                        text: 'El usuario ha sido eliminado exitosamente',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#10b981',
                        timer: 3000,
                        timerProgressBar: true
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Usuario eliminado exitosamente');
                    window.location.reload();
                }
            } else {
                closeDeleteModal();
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'No se pudo eliminar el usuario',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    alert('Error: ' + (data.error || 'No se pudo eliminar el usuario'));
                }
            }
        } catch (error) {
            console.error('Error:', error);
            closeDeleteModal();

            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error de conexión');
            }
        }
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    let searchTimeout;

    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.trim();

        // Limpiar timeout anterior
        clearTimeout(searchTimeout);

        if (searchTerm === '') {
            clearButton.style.display = 'none';
            currentSearchTerm = ''; // Limpiar término de búsqueda
            window.location.reload(); // Recargar página para mostrar todos los usuarios
            return;
        }

        clearButton.style.display = 'block';

        // Esperar 300ms después de que el usuario deje de escribir
        searchTimeout = setTimeout(() => {
            buscarUsuarios(searchTerm);
        }, 300);
    });

    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        this.style.display = 'none';
        searchInput.focus();
        currentSearchTerm = ''; // Limpiar término de búsqueda
        window.location.reload(); // Recargar página para mostrar todos los usuarios
    });
}

// Función para cambiar de página
function goToPage(page) {
    if (currentSearchTerm) {
        // Si hay búsqueda activa, realizar búsqueda paginada
        buscarUsuarios(currentSearchTerm, page);
    } else {
        // Si no hay búsqueda, recargar página con nueva página
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
    }
}

// Función para actualizar la paginación durante búsqueda
function updateSearchPagination(data) {
    let paginationContainer = document.querySelector('.pagination-container');

    if (!paginationContainer) {
        // Crear contenedor de paginación si no existe
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        document.querySelector('.table-container').after(paginationContainer);
    }

    paginationContainer.style.display = 'flex';

    // Crear HTML de paginación
    const startItem = ((data.currentPage - 1) * 10) + 1;
    const endItem = Math.min(data.currentPage * 10, data.totalUsers);

    paginationContainer.innerHTML = `
        <div class="pagination-info">
            <p class="pagination-text">
                Mostrando ${startItem} a ${endItem} de ${data.totalUsers} usuarios
            </p>
        </div>

        <div class="pagination">
            ${data.hasPrev ? `
                <button class="pagination-btn" onclick="goToPage(${data.currentPage - 1})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Anterior
                </button>
            ` : ''}

            <div class="pagination-numbers">
                ${generatePaginationNumbers(data.currentPage, data.totalPages)}
            </div>

            ${data.hasNext ? `
                <button class="pagination-btn" onclick="goToPage(${data.currentPage + 1})">
                    Siguiente
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            ` : ''}
        </div>
    `;
}

function generatePaginationNumbers(currentPage, totalPages) {
    let html = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button class="pagination-number" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    return html;
}