function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para probar si una imagen existe
function probarImagen(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Función para encontrar la imagen correcta en la carpeta
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
    let ci = obtenerParametroURL('ci');
    
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

    // Actualizar título de la página
    document.title = perfil.nombre;

    // ENCONTRAR IMAGEN AUTOMÁTICAMENTE
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

    // Actualizar campos específicos
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
    if (perfil.email) {
        emailLink.href = 'mailto:' + perfil.email;
        emailLink.textContent = perfil.email;
    }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    cargarPerfil();
});