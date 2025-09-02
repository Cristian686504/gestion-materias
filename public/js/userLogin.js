document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');

    // Toggle password visibility
    passwordToggle.addEventListener('click', function(e) {
        e.preventDefault();

        const isVisible = passwordInput.type === 'text';
        passwordInput.type = isVisible ? 'password' : 'text';
        this.classList.toggle('toggle-visible', !isVisible);
    });

    // Función para mostrar error
    function showError(fieldId, message) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.login-field');
        const errorSpan = document.getElementById(`${fieldId}Error`);

        field.classList.remove('success');
        field.classList.add('error');
        errorSpan.textContent = message;
        errorSpan.classList.add('show');
    }

    // Función para limpiar error
    function clearError(fieldId) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.login-field');
        const errorSpan = document.getElementById(`${fieldId}Error`);

        field.classList.remove('error');
        errorSpan.textContent = '';
        errorSpan.classList.remove('show');

        const input = field.querySelector('input');
        if (input && input.value.trim() && !errorSpan.classList.contains('show')) {
            field.classList.add('success');
            setTimeout(() => {
                field.classList.remove('success');
            }, 2000);
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.login-field.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.login-field.success').forEach(field => {
            field.classList.remove('success');
        });
        document.querySelectorAll('.gentle-error.show').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
    }

    function showSuccess(fieldId) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.login-field');
        field.classList.remove('error');
        field.classList.add('success');

        setTimeout(() => {
            field.classList.remove('success');
        }, 2000);
    }

    // Validaciones en tiempo real
    usernameInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (!value) {
            showError('username', 'El nombre de usuario es requerido');
        } else {
            clearError('username');
        }
    });

    passwordInput.addEventListener('blur', function() {
        const value = this.value;
        if (!value) {
            showError('password', 'La contraseña es requerida');
        } else {
            clearError('password');
        }
    });

    // Función para enviar el formulario con AJAX
    async function submitForm(formData) {
        try {
            const response = await fetch('/user/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    password: formData.get('password')
                })
            });

            const data = await response.json();

            if (data.success) {

                // Redireccionar
                window.location.href = data.redirectTo || '/';
            } else {
                // Mostrar SweetAlert de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error de inicio de sesión',
                    text: data.error || 'Credenciales incorrectas',
                    confirmButtonText: 'Intentar nuevamente',
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Intenta nuevamente.',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#ef4444'
            });
        }
    }

    // Validación al enviar el formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        let isValid = true;

        // Limpiar errores previos
        clearAllErrors();

        // Validar username
        const username = usernameInput.value.trim();
        if (!username) {
            showError('username', 'El nombre de usuario es requerido');
            isValid = false;
        }

        // Validar password
        const password = passwordInput.value;
        if (!password) {
            showError('password', 'La contraseña es requerida');
            isValid = false;
        }

        // Si hay errores, hacer scroll al primer error
        if (!isValid) {
            const firstError = document.querySelector('.login-field.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Mostrar loading en el botón
        const submitButton = form.querySelector('.login-button');
        const buttonText = submitButton.querySelector('.button-text');
        const originalText = buttonText.textContent;

        submitButton.classList.add('loading');
        buttonText.textContent = 'Iniciando sesión...';
        submitButton.disabled = true;

        // Crear FormData y enviar
        const formData = new FormData(form);
        await submitForm(formData);

        // Restaurar botón (por si hay error)
        submitButton.classList.remove('loading');
        buttonText.textContent = originalText;
        submitButton.disabled = false;
    });
});