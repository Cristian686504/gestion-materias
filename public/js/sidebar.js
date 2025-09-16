// Función para activar el enlace del sidebar según la ruta actual
function setActiveSidebarItem() {
    // Obtener la ruta actual
    const currentPath = window.location.pathname;

    // Remover la clase 'active' de todos los enlaces del menú
    const menuLinks = document.querySelectorAll('.menu-link');
    menuLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Encontrar y activar el enlace correspondiente a la ruta actual
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');

        // Verificar si la ruta actual coincide con el href del enlace
        if (currentPath === href || currentPath.startsWith(href + '/')) {
            link.classList.add('active');
        }
    });
}

// Ejecutar la función cuando se carga la página
document.addEventListener('DOMContentLoaded', setActiveSidebarItem);

// También ejecutar cuando cambia la URL (para SPAs)
window.addEventListener('popstate', setActiveSidebarItem);