document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');

    // Toggle password visibility
    passwordToggle.addEventListener('click', function(e) {
        e.preventDefault();

        const isVisible = passwordInput.type === 'text';
        passwordInput.type = isVisible ? 'password' : 'text';
        confirmPasswordInput.type = isVisible ? 'password' : 'text';
        this.classList.toggle('toggle-visible', !isVisible);
    });

    // Función para mostrar error
    function showError(fieldId, message) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.register-field');
        const errorSpan = document.getElementById(`${fieldId}Error`);

        field.classList.remove('success');
        field.classList.add('error');
        errorSpan.textContent = message;
        errorSpan.classList.add('show');
    }

    // Función para limpiar error
    function clearError(fieldId) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.register-field');
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
        document.querySelectorAll('.register-field.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.register-field.success').forEach(field => {
            field.classList.remove('success');
        });
        document.querySelectorAll('.gentle-error.show').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
    }

    function showSuccess(fieldId) {
        const field = document.querySelector(`[name="${fieldId}"]`).closest('.register-field');
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
        } else if (value.length < 3) {
            showError('username', 'El nombre de usuario debe tener al menos 3 caracteres');
        } else {
            clearError('username');
        }
    });

    emailInput.addEventListener('blur', function() {
        const value = this.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!value) {
            showError('email', 'El correo electrónico es requerido');
        } else if (!emailRegex.test(value)) {
            showError('email', 'Ingresa un correo electrónico válido');
        } else {
            clearError('email');
        }
    });

    passwordInput.addEventListener('blur', function() {
        const value = this.value;
        if (!value) {
            showError('password', 'La contraseña es requerida');
        } else if (value.length < 6) {
            showError('password', 'La contraseña debe tener al menos 6 caracteres');
        } else {
            clearError('password');
            if (confirmPasswordInput.value) {
                validatePasswordConfirmation();
            }
        }
    });

    function validatePasswordConfirmation() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!confirmPassword) {
            showError('confirmPassword', 'Debes confirmar tu contraseña');
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Las contraseñas no coinciden');
        } else {
            clearError('confirmPassword');
        }
    }

    confirmPasswordInput.addEventListener('blur', validatePasswordConfirmation);

    // Función para enviar el formulario con AJAX
    async function submitForm(formData) {
        try {
            const response = await fetch('/user/registrarUsuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password')
                })
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar SweetAlert de éxito
                await Swal.fire({
                    icon: 'success',
                    title: '¡Registro exitoso!',
                    text: data.message,
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    timerProgressBar: true
                });

                // Redireccionar
                window.location.href = data.redirectTo || '/user/login';
            } else {
                // Mostrar SweetAlert de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error en el registro',
                    text: data.error,
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

        // Validar confirmPassword
        const confirmPassword = confirmPasswordInput.value;
        if (!confirmPassword) {
            showError('confirmPassword', 'Debes confirmar tu contraseña');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Las contraseñas no coinciden');
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
        const submitButton = form.querySelector('.register-button');
        const buttonText = submitButton.querySelector('.button-text');
        const originalText = buttonText.textContent;

        submitButton.classList.add('loading');
        buttonText.textContent = 'Registrando...';
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