// Script para activar automáticamente el enlace correspondiente
document.addEventListener('DOMContentLoaded', function() {
    // Obtener la URL actual
    const currentPath = window.location.pathname;
    
    // Obtener todos los enlaces de la barra de navegación
    const navLinks = document.querySelectorAll('.nav-bar a');
    
    // Remover la clase 'active' de todos los enlaces
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Añadir la clase 'active' al enlace que coincida con la URL actual
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Verificar si el path actual coincide con el href del enlace
        if (currentPath === linkPath || 
            (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        }
    });
    
    // Caso especial: si estás en la página principal y tienes un enlace "home"
    if (currentPath === '/' || currentPath === '/home') {
        const homeLink = document.querySelector('.nav-bar a[href="/"], .nav-bar a[href="/home"]');
        if (homeLink) {
            homeLink.classList.add('active');
        }
    }
});

// Función alternativa más específica para tus rutas
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-bar a');
    
    // Mapeo de rutas a enlaces
    const routeMap = {
        '/estudiante/materias': 'Materias',
        '/estudiante/historial': 'Historial',
        '/estudiante/matriculacion': 'Matriculación'
    };
    
    // Remover todas las clases active
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Buscar y activar el enlace correspondiente
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// Llamar la función cuando se carga la página
document.addEventListener('DOMContentLoaded', setActiveNavLink);

// Opcional: También ejecutar cuando se navega por SPA (Single Page Applications)
window.addEventListener('popstate', setActiveNavLink);