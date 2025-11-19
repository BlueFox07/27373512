function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Configuración de idiomas disponibles
const configuracionIdiomas = {
    'es': 'configES',
    'en': 'configEN', 
    'pt': 'configPT'
};

// Variable global para la configuración de idioma
let configIdioma = null;

// Función para cargar la configuración de idioma
async function cargarIdioma() {
    const lang = obtenerParametroURL('lang') || 'es'; // Por defecto español
    
    console.log(`Cargando idioma: ${lang}`); //Ej: perfil.html?lang=
    
    const archivoIdioma = configuracionIdiomas[lang] || 'configES';
    const rutaIdioma = `reto3/conf/${archivoIdioma}.json`;
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = rutaIdioma;
        
        script.onload = function() {
            // Buscar la variable de configuración
            if (typeof config !== 'undefined') {
                configIdioma = config;
                console.log('Configuración de idioma cargada:', configIdioma);
                aplicarIdiomaInterfaz();
                resolve(configIdioma);
            } else {
                reject(new Error('No se pudo cargar la configuración de idioma'));
            }
        };
        
        script.onerror = function() {
            console.error(`Error cargando idioma: ${rutaIdioma}`);
            // Cargar idioma por defecto
            cargarIdiomaPorDefecto().then(resolve).catch(reject);
        };
        
        document.head.appendChild(script);
    });
}

// Función para cargar idioma por defecto (español)
async function cargarIdiomaPorDefecto() {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'reto3/conf/configES.json';
        
        script.onload = function() {
            if (typeof config !== 'undefined') {
                configIdioma = config;
                console.log('Idioma por defecto (español) cargado');
                aplicarIdiomaInterfaz();
                resolve(configIdioma);
            }
        };
        
        script.onerror = function() {
            console.error('Error cargando idioma por defecto');
            // Configuración mínima por defecto
            configIdioma = {
                "sitio": ["ATI", "[UCV]", "2025-2"],
                "home": "Inicio",
                "login": "Entrar",
                "copyRight": "Copyright © 2025 Escuela de computación - ATI. Todos los derechos reservados",
                "nombre": "Nombre",
                "descripcion": "",
                "color": "Mi color favorito es",
                "libro": "Mi libro favorito es",
                "musica": "Mi estilo de música preferida",
                "video_juego": "Vídeo juegos favoritos",
                "lenguajes": "Lenguajes aprendidos",
                "email": "Si necesitan comunicarse conmigo me pueden escribir a [email]",
                "buscar": "Buscar",
                "saludo": "Hola, Brandon"
            };
            aplicarIdiomaInterfaz();
            resolve(configIdioma);
        };
        
        document.head.appendChild(script);
    });
}

// Función para aplicar el idioma a toda la interfaz
function aplicarIdiomaInterfaz() {
    if (!configIdioma) return;
    
    console.log('Aplicando idioma a toda la interfaz:', configIdioma);
    
    // Actualizar título de la página
    if (configIdioma.sitio && Array.isArray(configIdioma.sitio)) {
        document.title = configIdioma.sitio.join(' ');
    }
    
    // Actualizar etiquetas de los campos del perfil
    const etiquetasCampos = [
    { selector: '.campo:nth-child(1) .campo-label', texto: configIdioma.color || 'Color Favorito', mantenerHTML: false },
    { selector: '.campo:nth-child(2) .campo-label', texto: configIdioma.libro || 'Libro Favorito', mantenerHTML: false },
    { selector: '.campo:nth-child(3) .campo-label', texto: configIdioma.musica || 'Música Preferida', mantenerHTML: false },
    { selector: '.campo:nth-child(4) .campo-label', texto: configIdioma.video_juego || 'Videojuegos Favoritos', mantenerHTML: false },
    { selector: '.campo:nth-child(5) .campo-label', texto: configIdioma.lenguajes || 'Lenguajes Aprendidos', mantenerHTML: true }, 
    { selector: '.campo:nth-child(6) .campo-label', texto: configIdioma.email || 'Si necesitan comunicarse conmigo me pueden escribir a:', mantenerHTML: false }
];

    etiquetasCampos.forEach(campo => {
    const elemento = document.querySelector(campo.selector);
    if (elemento) {
        if (campo.mantenerHTML) {
            // Para lenguajes: mantener la estructura con <strong>
            elemento.innerHTML = `<strong>${campo.texto}</strong>`;
        } else {
            // Para los demás: reemplazar solo texto
            elemento.textContent = campo.texto;
        }
    }
});
}

function probarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function encontrarImagen(ci) {
    const rutaBase = `reto3/${ci}/`;
    const formatos = ['.jpg', '.png', '.JPG', '.PNG', '.jpeg', '.JPEG'];
    
    const nombresPosibles = [
        ci, 
        `${ci}Grande`, 
        `${ci}Pequeña`, 
        'perfil', 
        'foto', 
        'imagen' 
    ];

    // Probar todas las combinaciones
    for (const nombre of nombresPosibles) {
        for (const formato of formatos) {
            const rutaCompleta = rutaBase + nombre + formato;
            const existe = await probarImagen(rutaCompleta);
            if (existe) {
                console.log(`Imagen encontrada: ${rutaCompleta}`);
                return rutaCompleta;
            }
        }
    }
    
    console.log('No se encontró ninguna imagen en la carpeta');
    return null;
}

// Función para cargar los datos del perfil
async function cargarPerfil() {
    let ci = obtenerParametroURL('ci'); //Ej: perfil.html?ci=
    
    if (!ci) {
        console.error('No se especificó el parámetro "ci" en la URL. Estableciendo por defecto....');
        ci = 27373512;
    }

    console.log(`Cargando perfil para CI: ${ci}`);

    const rutaPerfil = `reto3/${ci}/perfil.json`;

    const script = document.createElement('script');
    script.src = rutaPerfil;
    
    script.onload = async function() {
        console.log('Perfil cargado exitosamente');
        
        // Buscar la variable global con los datos
        let datosPerfil;
        if (typeof perfil !== 'undefined') {
            datosPerfil = perfil;
        } else if (typeof config !== 'undefined') {
            datosPerfil = config;
        } else {
            console.error('No se encontró la variable con los datos del perfil');
            return;
        }

        // Encontrar y cargar la imagen automáticamente
        await mostrarDatosPerfil(datosPerfil, ci);
    };
    
    script.onerror = function() {
        console.error('Error cargando el perfil desde:', rutaPerfil);
    };
    
    document.head.appendChild(script);
}

// Función para mostrar los datos en el HTML
async function mostrarDatosPerfil(perfil, ci) {
    console.log('Mostrando datos del perfil:', perfil);

    document.title = perfil.nombre || 'Perfil';

    const rutaImagen = await encontrarImagen(ci);
    
    if (rutaImagen) {
        document.getElementById('fotoGrande').src = rutaImagen;
        document.getElementById('fotoPequena').src = rutaImagen;
        console.log('Imágenes cargadas:', rutaImagen);
    } else {
        console.log('No se cargaron imágenes - no se encontró ninguna');
    }

    // Actualizar datos básicos
    document.getElementById('nombreCompleto').textContent = perfil.nombre || '';
    document.getElementById('descripcion').textContent = perfil.descripcion || '';

    // Actualizar valores de los campos
    document.getElementById('colorFavorito').textContent = perfil.color || '';
    document.getElementById('libroFavorito').textContent = perfil.libro || '';
    document.getElementById('musicaPreferida').textContent = perfil.musica || '';
    
    // Manejar arrays
    if (Array.isArray(perfil.video_juego)) {
        document.getElementById('videojuegosFavoritos').textContent = perfil.video_juego.join(', ');
    } else {
        document.getElementById('videojuegosFavoritos').textContent = perfil.video_juego || '';
    }

    if (Array.isArray(perfil.lenguajes)) {
        document.getElementById('lenguajesAprendidos').textContent = perfil.lenguajes.join(', ');
    } else {
        document.getElementById('lenguajesAprendidos').textContent = perfil.lenguajes || '';
    }

    // Actualizar email
     const emailLink = document.getElementById('emailLink');
    const lang = obtenerParametroURL('lang') || 'es';
    const campoLabel = document.querySelector('.campo:nth-child(6) .campo-label');
    
    if (perfil.email) {
        emailLink.href = 'mailto:' + perfil.email;
        
        // Obtener el texto del email desde la configuración de idioma
        let textoEmail = configIdioma?.email || 'Si necesitan comunicarse conmigo me pueden escribir a [email]';
        
        if (lang === 'en' && textoEmail.includes('[email]')) {
            const textoSinEmail = textoEmail.replace(/\[email\]/g, '');
            if (campoLabel) {
                campoLabel.textContent = textoSinEmail;
            }
            emailLink.textContent =  perfil.email;
        } else {
            const textoSinEmail = textoEmail.replace(/\[email\]/g, '');
            if (campoLabel) {
                campoLabel.textContent = textoSinEmail;
            }
            emailLink.textContent = perfil.email;
        }
    } else {
        let textoEmail = configIdioma?.email || 'Si necesitan comunicarse conmigo me pueden escribir a [email]';
        const textoSinEmail = textoEmail.replace(/\[email\]/g, '');
        
        if (campoLabel) {
            campoLabel.textContent = textoSinEmail;
        }
        
        emailLink.textContent = '';
        emailLink.href = '#';
        emailLink.style.pointerEvents = 'none';
    }
}

// Función para inicializar la aplicación
async function inicializar() {
    // Primero cargar el idioma (para las etiquetas)
    await cargarIdioma();
    // Luego cargar el perfil (para los datos)
    await cargarPerfil();
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    inicializar();
});