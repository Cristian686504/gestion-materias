// Variables globales
let currentEditingUserId = null;
let currentDeletingUserId = null;

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rolSelect = document.getElementById('rol');

    function showError(fieldId, message) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.register-field');
        const errorSpan = document.getElementById(`${fieldId}Error`);

        if (field) {
            field.classList.remove('success');
            field.classList.add('error');
        }

        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.add('show');
        }
    }

    async function obtenerUsuarioPorId(userId){
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
            return null; // Return null on error so calling code can handle it
        }
    }

    // Función para enviar el formulario con AJAX
    async function submitForm(formData) {
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
                // Primero cerrar el modal
                closeUserModal();

                // Luego mostrar SweetAlert inmediatamente
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
                    console.error('SweetAlert2 no está disponible');
                    alert('Usuario creado exitosamente');
                    window.location.reload();
                }
            } else {
                // Mostrar SweetAlert de error
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

    // Validación al enviar el formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        document.querySelectorAll('.register-field.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.gentle-error.show').forEach(error => {
            error.classList.remove('show');
        });

        // Validar username
        const username = usernameInput.value.trim();
        if (!username) {
            showError('username', 'El nombre de usuario es requerido');
            isValid = false;
        } else if (username.length < 3) {
            showError('username', 'El nombre de usuario debe tener al menos 3 caracteres');
            isValid = false;
        }

        // Validar email
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            showError('email', 'El correo electrónico es requerido');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError('email', 'Ingresa un correo electrónico válido');
            isValid = false;
        }

        // Validar password
        const password = passwordInput.value;
        if (!password) {
            showError('password', 'La contraseña es requerida');
            isValid = false;
        } else if (password.length < 6) {
            showError('password', 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }

        const rol = rolSelect.value;
        if (!rol){
            showError('rol', 'El rol es requerido');
            isValid = false;
        }

        // Si hay errores, hacer scroll al primer error
        if (!isValid) {
            const firstError = document.querySelector('.register-field.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = form.querySelector('#userSubmitBtn');
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
            // Crear FormData y enviar
            const formData = new FormData(form);
            await submitForm(formData);
        } finally {
            // Restaurar botón
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });

    // Event listener para el botón de confirmar eliminación
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteUser);

    // Event listeners para cerrar modales al hacer clic en el overlay
    document.getElementById('userModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeUserModal();
        }
    });

    document.getElementById('deleteModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDeleteModal();
        }
    });

    // Event listener para cerrar modales con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('userModal').classList.contains('show')) {
                closeUserModal();
            }
            if (document.getElementById('deleteModal').classList.contains('show')) {
                closeDeleteModal();
            }
        }
    });
});

// Función para mostrar modal de agregar usuario
function showAddUserModal() {
    currentEditingUserId = null;
    document.getElementById('userModalTitle').textContent = 'Agregar Nuevo Usuario';
    document.getElementById('userSubmitBtn').textContent = 'Guardar Usuario';

    // Limpiar formulario
    document.getElementById('userForm').reset();

    // Limpiar errores previos
    document.querySelectorAll('.register-field.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.gentle-error.show').forEach(error => {
        error.classList.remove('show');
    });

    document.getElementById('userModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para mostrar modal de editar usuario
async function showEditUserModal(userId) {
    currentEditingUserId = userId;

    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    document.getElementById('userSubmitBtn').textContent = 'Actualizar Usuario';

    // Aquí deberías obtener los datos del usuario y llenar el formulario
     const user = await obtenerUsuarioPorId(userId);
     if (user) {
         document.getElementById('username').value = user.username;
         document.getElementById('email').value = user.email;
         document.getElementById('password').value = '';
         document.getElementById('password').required = false;
         document.getElementById('rol').value = user.rol;
     }

    document.getElementById('userModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal de usuario
function closeUserModal() {
    document.getElementById('userModal').classList.remove('show');
    document.body.style.overflow = '';
    currentEditingUserId = null;

    // Limpiar formulario
    document.getElementById('userForm').reset();

    // Limpiar errores
    document.querySelectorAll('.register-field.error').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.gentle-error.show').forEach(error => {
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
            // Aquí deberías hacer la petición al servidor para eliminar
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

                    // Recargar la página
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('Usuario eliminado exitosamente');
                    window.location.reload();
                }
            } else {
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