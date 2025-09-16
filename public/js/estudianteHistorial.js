let editingId = null;
let userAuthId = null;
let currentEditingHistorialId = null;
let currentDeletingHistorialId = null;
let currentDeletingHistorialName = null;

// Elementos del DOM
const elements = {
    // Botones principales
    toggleManualForm: document.getElementById('toggleManualForm'),

    // Formulario manual
    manualForm: document.getElementById('manualForm'),
    closeManualForm: document.getElementById('closeManualForm'),
    materiaForm: document.getElementById('materiaForm'),
    cancelForm: document.getElementById('cancelForm'),
    submitText: document.getElementById('submitText'),

    // Loading
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    // Obtener el ID del usuario autenticado del template
    userAuthId = typeof window.userAuthId !== 'undefined' ? window.userAuthId :
        (typeof userAuth !== 'undefined' && userAuth.userInfo ? userAuth.userInfo.id :
            (document.querySelector('script[data-user-id]') ?
                document.querySelector('script[data-user-id]').getAttribute('data-user-id') : null));

    const editForm = document.getElementById('editHistorialForm');

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

    // Función para editar materia
    async function editHistorial(formData) {
        try {
            const response = await fetch('/estudiante/editarHistorial', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: currentEditingHistorialId,
                    estado: formData.get('edit_estado'),
                })
            });
            const data = await response.json();
            console.log(data.success)
            if (data.success) {
                closeEditHistorialModal();

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

    // Validación formulario editar materia
    editForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('#editHistorialModal .form-group.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('#editHistorialModal .gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar semestre  
        const estado = document.getElementById('edit_estado').value.trim();
        if (!estado) {
            showError('estado', 'El estado del historial es requerido', true);
            isValid = false;
        }

        if (!isValid) {
            const firstError = document.querySelector('#editHistorialModal .form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = this.querySelector('#editHistorialSubmitBtn');
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
            await editHistorial(formData);
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', eliminarHistorial);
    initializeSearch();

});

function filtrarMateriasDisponibles() {
    const selectMateria = document.getElementById('materia');
    const historialBody = document.getElementById('historialBody');
    
    if (!selectMateria || !historialBody) return;
    
    // Obtener materias ya en el historial
    const materiasEnHistorial = [];
    const rows = historialBody.querySelectorAll('tr[data-id]');
    
    rows.forEach(row => {
        const materiaCell = row.querySelector('td:first-child');
        if (materiaCell) {
            materiasEnHistorial.push(materiaCell.textContent.trim());
        }
    });
    
    // Filtrar opciones del select
    const options = selectMateria.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === '') return; // Mantener opción vacía
        
        const materiaNombre = option.textContent.split('(')[0].trim();
        if (materiasEnHistorial.includes(materiaNombre)) {
            option.style.display = 'none';
            option.disabled = true;
        } else {
            option.style.display = 'block';
            option.disabled = false;
        }
    });
}


// Configuración de eventos
function setupEventListeners() {
    // Botones principales
    elements.toggleManualForm.addEventListener('click', toggleManualForm);

    // Formulario manual
    elements.closeManualForm.addEventListener('click', closeManualForm);
    elements.cancelForm.addEventListener('click', closeManualForm);
    elements.materiaForm.addEventListener('submit', handleFormSubmit);
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
            // Recargar página para mostrar todos los usuarios
            window.location.reload();
            return;
        }

        clearButton.style.display = 'block';

        // Debounce - esperar 300ms después de que el usuario deje de escribir
        searchTimeout = setTimeout(() => {
            buscarHistorial(searchTerm);
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

// Gestión de formularios
function toggleManualForm() {
    resetForm();
    filtrarMateriasDisponibles();
    elements.manualForm.classList.remove('hidden');
    elements.manualForm.scrollIntoView({ behavior: 'smooth' });
}

function closeManualForm() {
    elements.manualForm.classList.add('hidden');
    resetForm();
}

function resetForm() {
    elements.materiaForm.reset();
    elements.submitText.textContent = 'Agregar Materia';
    editingId = null;
}

// Manejo del formulario
async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(elements.materiaForm);
    const materiaData = {
        userId: userAuthId,
        materiaId: formData.get('materia'),
        estado: formData.get('estado')
    };

    showLoading();

    try {
        await createMateria(materiaData);
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Materia agregada correctamente',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#10b981'
            });
        }

        closeManualForm();
        window.location.reload();
    } catch (error) {
        console.error('Error al guardar materia:', error);
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar la materia',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        }
    } finally {
        hideLoading();
    }
}

// CRUD Operations
async function createMateria(materiaData) {
    const response = await fetch('/estudiante/historial', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(materiaData)
    });

    if (!response.ok) {
        throw new Error('Error al crear materia');
    }

    return response.json();
}

async function eliminarHistorial() {
    const historialId = currentDeletingHistorialId;
    const materiaNombre = currentDeletingHistorialName;

    // Validar que historialId sea una cadena válida
    if (!historialId || typeof historialId !== 'string') {
        console.error('ID de historial inválido:', historialId);
        
        if (typeof Swal !== 'undefined') {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'ID de historial inválido',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        }
        return;
    }

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
        const response = await fetch('/estudiante/eliminarHistorial', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                historialId: historialId // Asegurar que sea el ID como string
            })
        });

        const data = await response.json();

        if (data.success) {
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
            // Recargar la página para actualizar la lista
            window.location.reload();
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

function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function closeEditHistorialModal() {
    document.getElementById('editHistorialModal').classList.remove('show');
    document.body.style.overflow = '';

    document.getElementById('editHistorialForm').reset();

    // Limpiar errores
    document.querySelectorAll('#editHistorialModal .form-group.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('#editHistorialModal .gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });
}

async function obtenerHistoiral(historialId) {
    try {
        const response = await fetch(`/estudiante/getHistorialById/${historialId}`, {
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

async function buscarHistorial(searchTerm) {
    try {
        currentSearchTerm = searchTerm;
        const tableBody = document.getElementById('historialBody');

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

        const response = await fetch(`/estudiante/buscarHistorial/${searchTerm}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        // Limpiar tabla
        tableBody.innerHTML = '';

        if (data.historial && data.historial.length > 0) {
            data.historial.forEach(item => {
                const row = document.createElement('tr');
                const estado = item.estado.toLowerCase().replace(' ', '_');

                // Verificar si el usuario actual puede ser editado/eliminado
                const actionButtons = `
                    <div class="table-actions">
                        <button class="btn btn-sm"
                            onclick="showEditHistorialModal('${item._id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <button class="btn btn-secondary btn-sm"
                            onclick="showDeleteConfirmModal('${item._id}','${item.materia.nombre}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                `;
                row.innerHTML = `
                    <td>${item.materia.nombre}</td>
                    <td>${item.materia.creditos}</td>
                    <td>${item.materia.semestre}</td>
                    <td>
                        <span class="estado ${estado}">
                            ${item.estado.replace('_', ' ')}
                        </span>
                    </td>
                    <td>${actionButtons}</td>
                `;

                tableBody.appendChild(row);
            });

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
        }

    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        const tableBody = document.getElementById('historialBody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 40px; color: #ef4444;">
                    Error al buscar usuarios. Intenta nuevamente.
                </td>
            </tr>
        `;
    }
}

// Función para mostrar modal de editar materia
async function showEditHistorialModal(historialId) {
    try {
        currentEditingHistorialId = historialId;
        const historial = await obtenerHistoiral(historialId);

        if (historial && historial.success !== false) {
            document.getElementById('edit_estado').value = historial.estado || '';

            // Limpiar errores previos
            document.querySelectorAll('#editHistorialModal .form-group.error').forEach(field => {
                field.classList.remove('error');
            });
            document.querySelectorAll('#editHistorialModal .gentle-error.show').forEach(error => {
                error.classList.remove('show');
            });

            document.getElementById('editHistorialModal').classList.add('show');
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

function showDeleteConfirmModal(historialId, nombre) {
    currentDeletingHistorialId = historialId;
    currentDeletingHistorialName = nombre;
    document.getElementById('deleteHistorialName').textContent = nombre;
    document.getElementById('deleteModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    document.body.style.overflow = '';
    currentDeletingHistorialId = null;
}