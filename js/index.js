// js/index.js

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la aplicación cuando el DOM esté listo
    inicializar();
});

function inicializar() {
    console.log('Inicializando aplicación...');
    
    // Cargar configuración
    cargarConfiguracion();
    
    // Configurar event listeners
    configurarEventos();
}

function cargarConfiguracion() {
    // Usar la variable global config que está definida en el JSON
    if (typeof config !== 'undefined') {
        aplicarConfiguracion(config);
    } else {
        console.warn('No se encontró la configuración global "config"');
        aplicarConfiguracion(getConfigPorDefecto());
    }
}

function getConfigPorDefecto() {
    return {
        "sitio": ["ATI", "[UCV]", "2025-2"],
        "home": "Inicio",
        "login": "Entrar",
        "copyRight": "Copyright © 2025 Escuela de computación - ATI. Todos los derechos reservados",
        "nombre": "Nombre",
        "buscar": "Buscar",
        "saludo": "Hola"
    };
}

function aplicarConfiguracion(config) {
    console.log('Aplicando configuración:', config);
    
    // Actualizar el título de la página con los datos del sitio
    if (config.sitio && Array.isArray(config.sitio)) {
        document.title = config.sitio.join(' ');
    }
    
    // Actualizar el header ATI[UCV]
    const atiElement = document.querySelector('.ati-ucv');
    if (atiElement && config.sitio) {
        // Formatear el texto del sitio: "ATI[UCV] 2025-2"
        let textoSitio = '';
        if (config.sitio.length >= 3) {
            textoSitio = `${config.sitio[0]}${config.sitio[1]} ${config.sitio[2]}`;
        } else {
            textoSitio = config.sitio.join(' ');
        }
        atiElement.textContent = textoSitio;
    }
    
    // Actualizar saludo del usuario
    const greetingElement = document.querySelector('.user-greeting');
    if (greetingElement && config.saludo) {
        // Mantener "Hola, Brandon" o aplicar nuevo saludo
        const nombreActual = greetingElement.textContent.replace('Hola, ', '');
        if (nombreActual && nombreActual !== 'Brandon') {
            greetingElement.textContent = `${config.saludo}, ${nombreActual}`;
        } else {
            greetingElement.textContent = config.saludo;
        }
    }
    
    // Actualizar placeholder del buscador
    const searchInput = document.querySelector('.search-form input');
    if (searchInput && config.buscar) {
        searchInput.placeholder = config.buscar + '...';
    }
    
    // Actualizar texto del botón de búsqueda
    const searchButton = document.querySelector('.search-form button');
    if (searchButton && config.buscar) {
        searchButton.textContent = config.buscar;
    }
    
    // Actualizar el footer
    const footerElement = document.querySelector('footer p');
    if (footerElement && config.copyRight) {
        footerElement.textContent = config.copyRight;
    }
    
    const section = document.querySelector('section');
    if (section && config.home) {
        //section.innerHTML = `<h2>${config.home}</h2>`;
    }
}

function configurarEventos() {
    // Manejar el formulario de búsqueda
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="text"]');
            if (searchInput && searchInput.value.trim()) {
                realizarBusqueda(searchInput.value.trim());
            }
        });
    }
    
    console.log('Eventos configurados correctamente');
}

function realizarBusqueda(termino) {
    console.log(`Realizando búsqueda: ${termino}`);
    
    alert(`Buscando: ${termino}`);
}


function actualizarSaludo(nombre) {
    const greetingElement = document.querySelector('.user-greeting');
    if (greetingElement && config && config.saludo) {
        greetingElement.textContent = `${config.saludo}, ${nombre}`;
    }
}

function resetearConfiguracion() {
    aplicarConfiguracion(getConfigPorDefecto());
}

window.appController = {
    actualizarSaludo: actualizarSaludo,
    resetearConfiguracion: resetearConfiguracion,
    realizarBusqueda: realizarBusqueda
};

// Verificar que todo se cargó correctamente
window.addEventListener('load', function() {
    console.log('Aplicación completamente cargada y configurada');
});