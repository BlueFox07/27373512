// js/index.js

// Variables globales
let listaPerfiles = [];
let appConfig = null;
let inicializado = false; 

function inicializar() {
    if (inicializado) {
        console.log('⚠️ La aplicación ya estaba inicializada');
        return;
    }
    
    inicializado = true;
    console.log('✅ Inicializando aplicación...');
    
    if (typeof config !== 'undefined') {
        console.log('✅ Configuración encontrada en variable global "config"');
        appConfig = config;
        aplicarConfiguracion(appConfig);
    } else {
        console.warn('❌ Variable "config" no encontrada');
        usarConfigPorDefecto();
    }
    
    if (typeof perfiles !== 'undefined') {
        console.log('✅ Lista de estudiantes encontrada en variable global "perfiles"');
        listaPerfiles = perfiles;
        mostrarEstudiantesEnHTML();
    } else {
        console.warn('❌ Variable "perfiles" no encontrada');
    }
    
    configurarEventos();
    console.log('✅ Aplicación inicializada correctamente');
}

function mostrarEstudiantesEnHTML() {
    const listaContainer = document.querySelector('.personas-lista');
    
    if (!listaContainer) {
        console.error('No se encontró el contenedor de la lista');
        return;
    }
    
    // Limpiar la lista actual
    listaContainer.innerHTML = '';
    
    // Verificar si hay estudiantes para mostrar
    if (!listaPerfiles || listaPerfiles.length === 0) {
        return;
    }
    
    // Crear elementos para cada estudiante
    listaPerfiles.forEach((perfil, index) => {
        const elementoEstudiante = crearElementoEstudiante(perfil);
        listaContainer.appendChild(elementoEstudiante);
    });
    
    console.log(`✅ Mostrados ${listaPerfiles.length} estudiantes`);
}

function crearElementoEstudiante(perfil) {
    const li = document.createElement('li');
    li.className = 'persona-item';
    
    const imagenSrc = `./reto3/${perfil.imagen}`;
    
    li.innerHTML = `
        <div class="imagen-container">
            <img src="${imagenSrc}" alt="${perfil.nombre}" class="persona-foto imagen-grande" 
                 onerror="this.style.display='none'">
            <img src="${imagenSrc}" alt="${perfil.nombre}" class="persona-foto imagen-pequena"
                 onerror="this.style.display='none'">
        </div>
        <span class="persona-nombre">${perfil.nombre}</span>
    `;
    
    if (perfil.ci) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', function() {
            console.log(`Redirigiendo al perfil de ${perfil.nombre}`);
            window.location.href = `./reto3/${perfil.ci}/perfil.html`;
        });
    }
    
    return li;
}

function aplicarConfiguracion(config) {
    console.log('Aplicando configuración al HTML...');
    
    // Título de la página
    if (config.sitio && Array.isArray(config.sitio)) {
        document.title = config.sitio.join(' ');
    }
    
    // Header ATI[UCV]
    const atiElement = document.querySelector('.ati-ucv');
    if (atiElement && config.sitio) {
        let textoSitio = '';
        if (config.sitio.length >= 3) {
            textoSitio = `${config.sitio[0]}${config.sitio[1]} ${config.sitio[2]}`;
        } else {
            textoSitio = config.sitio.join(' ');
        }
        atiElement.textContent = textoSitio;
    }
    
    // Saludo del usuario
    const greetingElement = document.querySelector('.user-greeting');
    if (greetingElement && config.saludo) {
        greetingElement.textContent = `${config.saludo}, Brandon`;
    }
    
    // Campo de búsqueda
    const searchInput = document.querySelector('.search-form input');
    if (searchInput && config.buscar) {
        searchInput.placeholder = config.buscar + '...';
    }
    
    // Botón de búsqueda
    const searchButton = document.querySelector('.search-form button');
    if (searchButton && config.buscar) {
        searchButton.textContent = config.buscar;
    }
    
    // Footer
    const footerElement = document.querySelector('footer p');
    if (footerElement && config.copyRight) {
        footerElement.textContent = config.copyRight;
    }
    
    console.log('✅ Configuración aplicada correctamente');
}

function usarConfigPorDefecto() {
    appConfig = {
        "sitio": ["ATI", "[UCV]", "2025-2"],
        "home": "Inicio",
        "login": "Entrar",
        "copyRight": "Copyright © 2025 Escuela de computación - ATI. Todos los derechos reservados",
        "nombre": "Nombre",
        "buscar": "Buscar",
        "saludo": "Hola, Brandon"
    };
    aplicarConfiguracion(appConfig);
}

function configurarEventos() {
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
    
    console.log('✅ Eventos configurados');
}

function realizarBusqueda(termino) {
    console.log(`Buscando: ${termino}`);
    alert(`Buscando: ${termino}`);
}

// Inicializar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('🔄 Página completamente cargada, verificando variables globales...');
    console.log('config disponible:', typeof config !== 'undefined');
    console.log('perfiles disponible:', typeof perfiles !== 'undefined');
    
    // Pequeño delay para asegurar que todo esté listo
    setTimeout(() => {
        inicializar();
    }, 100);
});