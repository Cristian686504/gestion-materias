// Variables globales
let currentEditingMateriaId = null;
let currentDeletingMateriaId = null;
let currentSearchTerm = '';

let currentMateriaForPrevias = null;
let currentMateriaNombreForPrevias = '';
let todasLasMaterias = [];

function getSchedulesFromForm(formType = 'create') {
    const prefix = formType === 'edit' ? 'edit' : '';
    const scheduleList = document.getElementById(formType === 'edit' ? 'editScheduleList' : 'scheduleList');
    const schedules = [];

    const scheduleGroups = scheduleList.querySelectorAll('.schedule-input-group');
    scheduleGroups.forEach(group => {
        const dia = group.querySelector('select[name="dia[]"]').value;
        const horaInicio = group.querySelector('input[name="horaInicio[]"]').value;
        const horaFin = group.querySelector('input[name="horaFin[]"]').value;

        if (dia && horaInicio && horaFin) {
            schedules.push({ dia, horaInicio, horaFin });
        }
    });

    return schedules;
}

function addSchedule(formType = 'create') {
    const scheduleList = document.getElementById(formType === 'edit' ? 'editScheduleList' : 'scheduleList');
    const scheduleCount = scheduleList.children.length;

    const scheduleGroup = document.createElement('div');
    scheduleGroup.className = 'schedule-input-group';
    scheduleGroup.innerHTML = `
        <select class="form-input schedule-day" name="dia[]" required>
            <option value="">Seleccionar día</option>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miércoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sábado">Sábado</option>
        </select>
        <input type="time" class="form-input schedule-time" name="horaInicio[]" required>
        <span class="schedule-connector">a</span>
        <input type="time" class="form-input schedule-time" name="horaFin[]" required>
        <button type="button" class="remove-schedule-btn" onclick="removeSchedule(this)" ${scheduleCount === 0 ? 'style="display: none;"' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" />
            </svg>
        </button>
    `;

    scheduleList.appendChild(scheduleGroup);
    updateRemoveButtons(formType);
}

function removeSchedule(button) {
    const scheduleGroup = button.closest('.schedule-input-group');
    const scheduleList = scheduleGroup.parentElement;
    const formType = scheduleList.id === 'editScheduleList' ? 'edit' : 'create';

    scheduleGroup.remove();
    updateRemoveButtons(formType);
}

function updateRemoveButtons(formType = 'create') {
    const scheduleList = document.getElementById(formType === 'edit' ? 'editScheduleList' : 'scheduleList');
    const removeButtons = scheduleList.querySelectorAll('.remove-schedule-btn');

    removeButtons.forEach((button, index) => {
        button.style.display = removeButtons.length > 1 ? 'block' : 'none';
    });
}

async function obtenerMateriaPorId(materiaId) {
    try {
        const response = await fetch(`/admin/getMateriaById/${materiaId}`, {
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

async function buscarMaterias(searchTerm, page = 1) {
    try {
        currentSearchTerm = searchTerm;
        const tableBody = document.getElementById('materiasTableBody');

        // Mostrar indicador de carga
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 10px;">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" stroke-opacity="0.25"/>
                        <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"/>
                    </svg>
                    Buscando materias...
                </td>
            </tr>
        `;

        const response = await fetch(`/admin/buscarMaterias/${encodeURIComponent(searchTerm)}?page=${page}&limit=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        // Limpiar tabla
        tableBody.innerHTML = '';

        if (data.materias && data.materias.length > 0) {
            data.materias.forEach(materia => {
                const row = document.createElement('tr');

                const actionButtons = `
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="showEditMateriaModal('${materia._id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="showDeleteConfirmModal('${materia._id}','${materia.nombre}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Eliminar
                        </button>
                        <button class="btn btn-info btn-sm" onclick="showPreviasModal('${materia._id}', '${materia.nombre}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 17 21Z"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            </svg>
                            Previas
                        </button>
                    </div>
                `;

                row.innerHTML = `
                    <td>${materia.nombre}</td>
                    <td>${materia.creditos}</td>
                    <td>${materia.semestre}</td>
                    <td> ${materia.horarios.map(h => `• ${h.dia} ${h.horaInicio} - ${h.horaFin}`).join("<br>")}</td>
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
                    <td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto; display: block; margin-bottom: 16px; opacity: 0.5;">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <p style="margin: 0; font-size: 16px; font-weight: 500;">No se encontraron materias</p>
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
        console.error('Error al buscar materias:', error);
        const tableBody = document.getElementById('materiasTableBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">
                    Error al buscar materias. Intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const createForm = document.getElementById('materiaForm');
    const editForm = document.getElementById('editMateriaForm');


    document.getElementById('previasModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closePreviasModal();
        }
    });

    function showError(fieldId, message, isEditForm = false) {
        const formPrefix = isEditForm ? 'edit_' : '';

        // Buscar el campo con más flexibilidad
        let field = document.querySelector(`[name="${formPrefix}${fieldId}"]`);

        // Si no se encuentra con el prefijo, intentar sin él en caso de edición
        if (!field && isEditForm) {
            field = document.querySelector(`[id="${formPrefix}${fieldId}"]`);
        }

        // Si aún no se encuentra, intentar con el ID original
        if (!field) {
            field = document.getElementById(`${formPrefix}${fieldId}`);
        }

        const errorSpan = document.getElementById(`${formPrefix}${fieldId}Error`);

        if (field) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('success');
                formGroup.classList.add('error');
            }
        }

        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    // Función para crear materia
    async function createMateria(formData) {
        try {
            const schedules = getSchedulesFromForm('create');
            const response = await fetch('/admin/crearMateria', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.get('nombre'),
                    creditos: formData.get('creditos'),
                    semestre: formData.get('semestre'),
                    horarios: schedules,
                })
            });

            const data = await response.json();

            if (data.success) {

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Materia creado exitosamente!',
                        text: data.message || 'El materia se ha guardado correctamente',
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
                    alert('Materia creado exitosamente');
                    window.location.reload();
                }
            } else {

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error en el registro',
                        text: data.error || 'Ha ocurrido un error al crear el materia',
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

    // Función para editar materia
    async function editMateria(formData) {
        try {
            const schedules = getSchedulesFromForm('edit');
            const response = await fetch('/admin/editarMateria', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: currentEditingMateriaId,
                    nombre: formData.get('edit_nombre'),
                    creditos: formData.get('edit_creditos'),
                    semestre: formData.get('edit_semestre'),
                    horarios: schedules,
                })
            });

            const data = await response.json();

            if (data.success) {
                closeEditMateriaModal();

                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Materia actualizado exitosamente!',
                        text: data.message || 'El materia ha sido actualizado correctamente',
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
                    alert('Materia actualizado exitosamente');
                    window.location.reload();
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar',
                        text: data.error || 'Ha ocurrido un error al actualizar el materia',
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

    // Validación formulario crear materia
    createForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('#materiaModal .form-group.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('#materiaModal .gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar nombre
        const nombre = document.getElementById('nombre').value.trim();
        if (!nombre) {
            showError('nombre', 'El nombre de materia es requerido');
            isValid = false;
        }

        // Validar creditos
        const creditos = document.getElementById('creditos').value.trim();
        if (!creditos) {
            showError('creditos', 'Los creditos de la materia son requeridos');
            isValid = false;
        }

        const semestre = document.getElementById('semestre').value.trim();
        if (!semestre) {
            showError('semestre', 'El semestre de la materia es requerido');
            isValid = false;
        }

        const schedules = getSchedulesFromForm('create');
        if (schedules.length === 0) {
            showError('horarios', 'Al menos un horario es requerido');
            isValid = false;
        }

        if (!isValid) {
            const firstError = document.querySelector('#materiaModal .form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = this.querySelector('#materiaSubmitBtn');
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
            await createMateria(formData);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Validación formulario editar materia
    editForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('#editMateriaModal .form-group.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('#editMateriaModal .gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar nombre
        const nombre = document.getElementById('edit_nombre').value.trim();
        if (!nombre) {
            showError('nombre', 'El nombre de materia es requerido', true);
            isValid = false;
        }

        const creditos = document.getElementById('edit_creditos').value.trim();
        if (!creditos) {
            showError('creditos', 'Los creditos de la materia son requeridos', true);
            isValid = false;
        }

        // Validar semestre  
        const semestre = document.getElementById('edit_semestre').value.trim();
        if (!semestre) {
            showError('semestre', 'El semestre de la materia es requerido', true);
            isValid = false;
        }

        // Validar horarios
        const schedules = getSchedulesFromForm('edit'); // Cambiar de 'create' a 'edit'
        if (schedules.length === 0) {
            showError('horarios', 'Al menos un horario es requerido', true);
            isValid = false;
        }

        if (!isValid) {
            const firstError = document.querySelector('#editMateriaModal .form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = this.querySelector('#editMateriaSubmitBtn');
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
            await editMateria(formData);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Event listener para el botón de confirmar eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteMateria);

    // Event listeners para cerrar modales al hacer clic en el overlay
    document.getElementById('materiaModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeMateriaModal();
        }
    });

    document.getElementById('editMateriaModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditMateriaModal();
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
            if (document.getElementById('materiaModal').classList.contains('show')) {
                closeMateriaModal();
            }
            if (document.getElementById('editMateriaModal').classList.contains('show')) {
                closeEditMateriaModal();
            }
            if (document.getElementById('deleteModal').classList.contains('show')) {
                closeDeleteModal();
            }

        }
    });
    initializeSearch();
});

// Función para mostrar modal de agregar materia
function showAddMateriaModal() {
    document.getElementById('materiaForm').reset();

    // Limpiar errores previos
    document.querySelectorAll('#materiaModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#materiaModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });

    document.getElementById('materiaModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para mostrar modal de editar materia
async function showEditMateriaModal(materiaId) {
    currentEditingMateriaId = materiaId;

    try {
        const materia = await obtenerMateriaPorId(materiaId);

        if (materia && materia.success !== false) {
            document.getElementById('edit_nombre').value = materia.nombre || '';
            document.getElementById('edit_creditos').value = materia.creditos || '';
            document.getElementById('edit_semestre').value = materia.semestre || '';

            // Cargar horarios dinámicamente
            const editScheduleList = document.getElementById('editScheduleList');
            editScheduleList.innerHTML = '';

            if (materia.horarios && Array.isArray(materia.horarios)) {
                materia.horarios.forEach((horario, index) => {
                    const scheduleGroup = document.createElement('div');
                    scheduleGroup.className = 'schedule-input-group';
                    scheduleGroup.innerHTML = `
                        <select class="form-input schedule-day" name="dia[]" required>
                            <option value="">Seleccionar día</option>
                            <option value="Lunes" ${horario.dia === 'Lunes' ? 'selected' : ''}>Lunes</option>
                            <option value="Martes" ${horario.dia === 'Martes' ? 'selected' : ''}>Martes</option>
                            <option value="Miércoles" ${horario.dia === 'Miércoles' ? 'selected' : ''}>Miércoles</option>
                            <option value="Jueves" ${horario.dia === 'Jueves' ? 'selected' : ''}>Jueves</option>
                            <option value="Viernes" ${horario.dia === 'Viernes' ? 'selected' : ''}>Viernes</option>
                            <option value="Sábado" ${horario.dia === 'Sábado' ? 'selected' : ''}>Sábado</option>
                        </select>
                        <input type="time" class="form-input schedule-time" name="horaInicio[]" value="${horario.horaInicio || ''}" required>
                        <span class="schedule-connector">a</span>
                        <input type="time" class="form-input schedule-time" name="horaFin[]" value="${horario.horaFin || ''}" required>
                        <button type="button" class="remove-schedule-btn" onclick="removeSchedule(this)" ${index === 0 && materia.horarios.length === 1 ? 'style="display: none;"' : ''}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" />
                            </svg>
                        </button>
                    `;
                    editScheduleList.appendChild(scheduleGroup);
                });
            } else {
                // Si no hay horarios, agregar uno vacío
                addSchedule('edit');
            }

            updateRemoveButtons('edit');

            // Limpiar errores previos
            document.querySelectorAll('#editMateriaModal .form-group.error').forEach(field => {
                field.classList.remove('error');
            });
            document.querySelectorAll('#editMateriaModal .gentle-error.show').forEach(error => {
                error.classList.remove('show');
            });

            document.getElementById('editMateriaModal').classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            if (typeof Swal !== 'undefined') {
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron obtener los datos del materia',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: No se pudieron obtener los datos del materia');
            }
        }
    } catch (error) {
        console.error('Error al obtener materia:', error);
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

// Función para cerrar modal de crear materia
function closeMateriaModal() {
    document.getElementById('materiaModal').classList.remove('show');
    document.body.style.overflow = '';

    document.getElementById('materiaForm').reset();

    // Limpiar errores
    document.querySelectorAll('#materiaModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#materiaModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

// Función para cerrar modal de editar materia
function closeEditMateriaModal() {
    document.getElementById('editMateriaModal').classList.remove('show');
    document.body.style.overflow = '';
    currentEditingMateriaId = null;

    document.getElementById('editMateriaForm').reset();

    // Limpiar errores
    document.querySelectorAll('#editMateriaModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#editMateriaModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

async function showPreviasModal(materiaId, materiaNombre) {
    currentMateriaForPrevias = materiaId;
    currentMateriaNombreForPrevias = materiaNombre;
    // Actualizar título del modal
    document.getElementById('previasModalTitle').textContent = `Previas de ${materiaNombre}`;

    // Cargar todas las materias para los selects
    await cargarTodasLasMaterias();
    // Cargar previas actuales
    await cargarPreviasActuales(materiaId);

    // Mostrar modal
    document.getElementById('previasModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal de previas
function closePreviasModal() {
    document.getElementById('previasModal').classList.remove('show');
    document.body.style.overflow = '';
    currentMateriaForPrevias = null;
    currentMateriaNombreForPrevias = '';
}

// Función para cargar todas las materias
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

// Función para actualizar el select de materias
function actualizarSelectMaterias() {
    const select = document.getElementById('selectMateriaPrevias');
    select.innerHTML = '<option value="">Seleccionar materia...</option>';

    // Filtrar la materia actual para no permitir que se agregue a sí misma como previa
    const materiasFiltradas = todasLasMaterias.filter(materia => materia._id !== currentMateriaForPrevias);

    materiasFiltradas.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia._id;
        option.textContent = `${materia.nombre} (${materia.semestre})`;
        select.appendChild(option);
    });
}

// Función para cargar previas actuales
async function cargarPreviasActuales(id) {
    try {
        const response = await fetch(`/admin/getPrevias/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        if (data.success) {
            mostrarPreviasActuales(data.previas || []);
        } else {
            mostrarPreviasActuales([]);
        }
    } catch (error) {
        console.error('Error al cargar previas:', error);
        mostrarPreviasActuales([]);
    }
}

// Función para mostrar las previas actuales
function mostrarPreviasActuales(previas) {
    const container = document.getElementById('previasActualesList');

    if (previas.length === 0) {
        container.innerHTML = `
            <div class="no-previas" style="text-align: center; padding: 20px; color: #6b7280; font-style: italic;">
                No hay previas configuradas
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    previas.forEach(previa => {
        const previaElement = document.createElement('div');
        previaElement.className = 'previa-item';
        previaElement.innerHTML = `
            <div class="previa-info">
                <div class="previa-nombre">${previa.nombre}</div>
                <div class="previa-requisito">
                    ${previa.semestre} • 
                    <span class="previa-badge ${previa.requisito}">${previa.requisito === 'aprobada' ? 'Aprobada' : 'En examen'}</span>
                </div>
            </div>
            <div class="previa-actions">
                <button class="btn-remove-previa" onclick="eliminarPrevia('${previa.materiaId}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" />
                    </svg>
                </button>
            </div>
        `;
        container.appendChild(previaElement);
    });
}

// Función para agregar nueva previa
async function agregarPrevia() {
    const materiaSelect = document.getElementById('selectMateriaPrevias');
    const requisitoSelect = document.getElementById('selectRequisito');

    const materiaPreviaId = materiaSelect.value;
    const requisito = requisitoSelect.value;

    if (!materiaPreviaId || !requisito) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor selecciona una materia y un requisito',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f59e0b'
            });
        } else {
            alert('Por favor selecciona una materia y un requisito');
        }
        return;
    }

    try {
        const response = await fetch('/admin/agregarPrevia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                materiaId: currentMateriaForPrevias,
                materiaPreviaId: materiaPreviaId,
                requisito: requisito
            })
        });

        const data = await response.json();

        if (data.success) {
            // Limpiar selects
            materiaSelect.value = '';
            requisitoSelect.value = '';

            // Recargar previas actuales
            await cargarPreviasActuales(currentMateriaForPrevias);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Previa agregada',
                    text: 'La previa se agregó exitosamente',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'No se pudo agregar la previa',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: ' + (data.error || 'No se pudo agregar la previa'));
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
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

// Función para eliminar previa
async function eliminarPrevia(materiaPreviaId) {
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar previa?',
            text: '¿Estás seguro de que quieres eliminar esta previa?',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (!result.isConfirmed) return;
    } else {
        if (!confirm('¿Estás seguro de que quieres eliminar esta previa?')) return;
    }

    try {
        console.log(currentMateriaForPrevias, materiaPreviaId);
        const response = await fetch('/admin/eliminarPrevia', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                materiaId: currentMateriaForPrevias,
                materiaPreviaId: materiaPreviaId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Recargar previas actuales
            await cargarPreviasActuales(currentMateriaForPrevias);
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'success',
                    title: 'Previa eliminada',
                    text: 'La previa se eliminó exitosamente',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'No se pudo eliminar la previa',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#ef4444'
                });
            } else {
                alert('Error: ' + (data.error || 'No se pudo eliminar la previa'));
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
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

// Función para mostrar modal de confirmación de eliminación
function showDeleteConfirmModal(materiaId, nombre) {
    currentDeletingMateriaId = materiaId;
    document.getElementById('deleteMateriaName').textContent = nombre;
    document.getElementById('deleteModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal de eliminación
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    document.body.style.overflow = '';
    currentDeletingMateriaId = null;
}

// Función para eliminar materia
async function deleteMateria() {
    if (currentDeletingMateriaId) {
        try {
            const response = await fetch(`/admin/eliminarMateria/${currentDeletingMateriaId}`, {
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
                        title: '¡Materia eliminado!',
                        text: 'El materia ha sido eliminado exitosamente',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#10b981',
                        timer: 3000,
                        timerProgressBar: true
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Materia eliminado exitosamente');
                    window.location.reload();
                }
            } else {
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'No se pudo eliminar el materia',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#ef4444'
                    });
                } else {
                    alert('Error: ' + (data.error || 'No se pudo eliminar el materia'));
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
            window.location.reload(); // Recargar página para mostrar todos los materias
            return;
        }

        clearButton.style.display = 'block';

        // Esperar 300ms después de que el usuario deje de escribir
        searchTimeout = setTimeout(() => {
            buscarMaterias(searchTerm);
        }, 300);
    });

    clearButton.addEventListener('click', function () {
        searchInput.value = '';
        this.style.display = 'none';
        searchInput.focus();
        currentSearchTerm = ''; // Limpiar término de búsqueda
        window.location.reload(); // Recargar página para mostrar todos los materias
    });
}

// Función para cambiar de página
function goToPage(page) {
    if (currentSearchTerm) {
        // Si hay búsqueda activa, realizar búsqueda paginada
        buscarMaterias(currentSearchTerm, page);
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
    const endItem = Math.min(data.currentPage * 10, data.totalMaterias);

    paginationContainer.innerHTML = `
        <div class="pagination-info">
            <p class="pagination-text">
                Mostrando ${startItem} a ${endItem} de ${data.totalMaterias} materias
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