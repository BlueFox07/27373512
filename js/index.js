// js/index.js

// Variables globales
let listaPerfiles = [];
let configIdioma = null;
let inicializado = false;

// Configuración de idiomas disponibles
const configuracionIdiomas = {
    'es': 'configES',
    'en': 'configEN', 
    'pt': 'configPT'
};

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para cargar la configuración de idioma
async function cargarIdioma() {
    const lang = obtenerParametroURL('lang') || 'es';
    
    console.log(`Cargando idioma para index: ${lang}`);
    
    // Si es español, usar el config que ya está cargado en el HTML
    if (lang === 'es') {
        if (typeof config !== 'undefined') {
            configIdioma = config;
            console.log('Configuración ES cargada desde HTML');
            aplicarIdiomaInterfaz();
            return configIdioma;
        } else {
            // Fallback si no se encuentra config
            configIdioma = getConfigPorDefecto();
            aplicarIdiomaInterfaz();
            return configIdioma;
        }
    }
    
    // Para inglés o portugués, cargar el archivo específico
    const archivoIdioma = configuracionIdiomas[lang];
    const rutaIdioma = `./reto3/conf/${archivoIdioma}.json`;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = rutaIdioma;
        
        script.onload = function() {
            // Buscar la variable de configuración
            if (typeof config !== 'undefined') {
                configIdioma = config;
                console.log(`Configuración ${lang.toUpperCase()} cargada:`, configIdioma);
                aplicarIdiomaInterfaz();
                resolve(configIdioma);
            } else {
                reject(new Error(`No se pudo cargar la configuración ${lang}`));
            }
        };
        
        script.onerror = function() {
            console.error(`Error cargando idioma ${lang}, usando español por defecto`);
            if (typeof config !== 'undefined') {
                configIdioma = config;
            } else {
                configIdioma = getConfigPorDefecto();
            }
            aplicarIdiomaInterfaz();
            resolve(configIdioma);
        };
        
        document.head.appendChild(script);
    });
}

// Configuración por defecto (solo si no hay config en HTML)
function getConfigPorDefecto() {
    return {
        "sitio": ["ATI", "[UCV]", "2025-2"],
        "home": "Inicio",
        "login": "Entrar",
        "copyRight": "Copyright © 2025 Escuela de computación - ATI. Todos los derechos reservados",
        "buscar": "Buscar",
        "saludo": "Hola",
        "noResultados": "No hay alumnos que tengan en su nombre: [query]"
    };
}

// Función para aplicar el idioma a la interfaz
function aplicarIdiomaInterfaz() {
    if (!configIdioma) return;
    
    console.log('Aplicando idioma a la interfaz de index:', configIdioma);
    
    // Actualizar título de la página
    if (configIdioma.sitio && Array.isArray(configIdioma.sitio)) {
        document.title = configIdioma.sitio.join(' ');
    }
    
   // Header ATI[UCV]
const atiElement = document.querySelector('.ati-ucv');
if (atiElement && configIdioma.sitio) {
    let textoSitio = '';
    if (configIdioma.sitio.length >= 3) {
        // Si hay 3 elementos, asumimos: [0]=ATI, [1]=[UCV], [2]=año
        const atiText = atiElement.querySelector('.ati-text');
        const ucvText = atiElement.querySelector('.ucv-text');
        const yearText = atiElement.querySelector('.year-text');
        
        if (atiText) atiText.textContent = configIdioma.sitio[0];
        if (ucvText) ucvText.textContent = configIdioma.sitio[1];
        if (yearText) yearText.textContent = configIdioma.sitio[2];
    } else {
        // Fallback: unir todo en el contenedor principal
        atiElement.textContent = configIdioma.sitio.join(' ');
    }
}
    
    // Saludo del usuario
    const greetingElement = document.querySelector('.user-greeting');
    if (greetingElement && configIdioma.saludo) {
        greetingElement.textContent = `${configIdioma.saludo}, Brandon`;
    }
    
    // Campo de búsqueda
    const searchInput = document.querySelector('.search-form input');
    if (searchInput && configIdioma.buscar) {
        searchInput.placeholder = configIdioma.buscar + '...';
    }
    
    // Botón de búsqueda
    const searchButton = document.querySelector('.search-form button');
    if (searchButton && configIdioma.buscar) {
        searchButton.textContent = configIdioma.buscar;
    }
    
    // Footer
    const footerElement = document.querySelector('footer p');
    if (footerElement && configIdioma.copyRight) {
        footerElement.textContent = configIdioma.copyRight;
    }
    
    console.log('Interfaz actualizada con el idioma seleccionado');
}

// Función para inicializar la pagina
async function inicializar() {
    if (inicializado) {
        console.log('La pagina ya estaba inicializada');
        return;
    }
    
    inicializado = true;
    console.log('Inicializando aplicación...');
    
    // Primero cargar el idioma
    await cargarIdioma();
    
    // Luego cargar los perfiles (ya están cargados en el HTML)
    if (typeof perfiles !== 'undefined') {
        console.log('Lista de estudiantes encontrada en variable global "perfiles"');
        listaPerfiles = perfiles;
        mostrarEstudiantesEnHTML(listaPerfiles);
    } else {
        console.warn('Variable "perfiles" no encontrada');
    }
    
    configurarEventos();
    console.log('Aplicación inicializada correctamente');
}

// Función para mostrar estudiantes en el HTML
function mostrarEstudiantesEnHTML(estudiantes, query = '') {
    const sectionContainer = document.querySelector('section');
    
    if (!sectionContainer) {
        console.error('No se encontró el contenedor section');
        return;
    }
    
    // Limpiar la sección completa
    sectionContainer.innerHTML = '';
    
    // Verificar si hay estudiantes para mostrar
    if (!estudiantes || estudiantes.length === 0) {
        mostrarMensajeNoResultados(query, sectionContainer);
        return;
    }
    
    // Si hay estudiantes, crear la estructura normal con la lista
    const divContainer = document.createElement('div');
    // Mantener la misma clase que tenía originalmente
    divContainer.className = 'personas-container'; 
    
    const listaContainer = document.createElement('ul');
    listaContainer.className = 'personas-lista';
    
    // Crear elementos para cada estudiante
    estudiantes.forEach((perfil) => {
        const elementoEstudiante = crearElementoEstudiante(perfil);
        listaContainer.appendChild(elementoEstudiante);
    });
    
    divContainer.appendChild(listaContainer);
    sectionContainer.appendChild(divContainer);
    
    console.log(`Mostrados ${estudiantes.length} estudiantes`);
}

// Función para mostrar mensaje cuando no hay resultados
function mostrarMensajeNoResultados(query = '', sectionContainer) {
    if (!sectionContainer) {
        sectionContainer = document.querySelector('section');
    }
    
    let mensaje = configIdioma?.noResultados || 'No hay alumnos que tengan en su nombre: [query]';
    
    // Reemplazar [query] por el término de búsqueda real
    if (query && mensaje.includes('[query]')) {
        mensaje = mensaje.replace('[query]', `"${query}"`);
    } else if (mensaje.includes('[query]')) {
        mensaje = mensaje.replace('[query]', '');
    }
    
    // Crear la estructura HTML completa para "sin resultados"
    sectionContainer.innerHTML = `
        <div class="no-results-container">
            <div class="no-results-message">
                ${mensaje}
            </div>
        </div>
    `;
    
    console.log('Mostrando mensaje de no resultados:', mensaje);
}

// Función para crear elemento de estudiante
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
            const lang = obtenerParametroURL('lang') || 'es';
            window.location.href = `./perfil.html?ci=${perfil.ci}&lang=${lang}`;
        });
    }
    
    return li;
}

// Función para realizar búsqueda en tiempo real
function realizarBusqueda(query) {
    console.log(`Buscando: "${query}"`);
    
    if (!query.trim()) {
        // Si la búsqueda está vacía, mostrar todos los estudiantes
        mostrarEstudiantesEnHTML(listaPerfiles);
        return;
    }
    
    // Filtrar estudiantes cuyo nombre contenga el query (case insensitive)
    const resultados = listaPerfiles.filter(estudiante => 
        estudiante.nombre.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`Encontrados ${resultados.length} resultados para "${query}"`);
    
    // Mostrar resultados o mensaje de no resultados
    mostrarEstudiantesEnHTML(resultados, query);
}

// Función para configurar eventos
function configurarEventos() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-form input[type="text"]');
    
    // Evento para búsqueda en tiempo real
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            realizarBusqueda(query);
        });
    }
    
    // Evento para submit del formulario (prevenir comportamiento por defecto)
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (searchInput && searchInput.value.trim()) {
                realizarBusqueda(searchInput.value.trim());
            }
        });
    }
    
    console.log('Eventos configurados');
}

// Inicializar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('Página completamente cargada');
    console.log('Parámetro lang:', obtenerParametroURL('lang'));
    console.log('config disponible en HTML:', typeof config !== 'undefined');
    console.log('perfiles disponible:', typeof perfiles !== 'undefined');
    
    // Pequeño delay para asegurar que todo esté listo
    setTimeout(() => {
        inicializar();
    }, 100);
});