// js/spa.js - Single Page Application unificada con sesiones AJAX

class ATISPA {
    constructor() {
        this.configIdioma = null;
        this.perfiles = [];
        this.sessionData = null;
        this.currentView = 'list';
        this.currentProfileId = null;
        
        // Elementos del DOM
        this.appContainer = null;
        this.searchInput = null;
        this.searchForm = null;
        
        this.init();
    }
    
    async init() {
        console.log('=== INICIALIZANDO SPA ===');
        console.log('URL completa:', window.location.href);
        console.log('Parámetros:', new URLSearchParams(window.location.search).toString());
        
        // 1. Inicializar elementos del DOM
        this.initDOM();
        
        // 2. Cargar idioma
        await this.cargarIdioma();
        
        // 3. Inicializar sesión via AJAX
        await this.inicializarSesion();
        
        // 4. Cargar datos de estudiantes
        this.cargarDatosEstudiantes();
        
        // 5. Mostrar vista inicial
        this.mostrarListado();
        
        // 6. Configurar eventos
        this.configurarEventos();
        
        // 7. Manejar navegación por URL
        this.manejarNavegacionURL();
        
        console.log('✅ SPA inicializada correctamente');
    }
    
    initDOM() {
        this.appContainer = document.getElementById('app');
        this.searchInput = document.querySelector('.search-form input');
        this.searchForm = document.querySelector('.search-form');
        
        if (!this.appContainer) {
            console.error('No se encontró el contenedor #app');
        }
    }
    
    // ========== FUNCIONES DE IDIOMA ==========
    
    obtenerParametroURL(nombre) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(nombre);
    }
    
    async cargarIdioma() {
        const lang = this.obtenerParametroURL('lang') || 'es';
        
        console.log(`Cargando idioma: ${lang}`);
        
        const configuracionIdiomas = {
            'es': 'configES',
            'en': 'configEN', 
            'pt': 'configPT'
        };
        
        const archivoIdioma = configuracionIdiomas[lang] || 'configES';
        const rutaIdioma = `./conf/${archivoIdioma}.json`;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = rutaIdioma;
            
            script.onload = () => {
                if (typeof config !== 'undefined') {
                    this.configIdioma = config;
                    console.log('Configuración de idioma cargada:', this.configIdioma);
                    this.aplicarIdiomaInterfaz();
                    resolve(this.configIdioma);
                } else {
                    reject(new Error('No se pudo cargar la configuración de idioma'));
                }
            };
            
            script.onerror = () => {
                console.error(`Error cargando idioma: ${rutaIdioma}`);
                this.cargarIdiomaPorDefecto().then(resolve).catch(reject);
            };
            
            document.head.appendChild(script);
        });
    }
    
    async cargarIdiomaPorDefecto() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = './conf/configES.json';
            
            script.onload = () => {
                if (typeof config !== 'undefined') {
                    this.configIdioma = config;
                    console.log('Idioma por defecto (español) cargado');
                    this.aplicarIdiomaInterfaz();
                    resolve(this.configIdioma);
                }
            };
            
            script.onerror = () => {
                console.error('Error cargando idioma por defecto');
                this.configIdioma = {
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
                this.aplicarIdiomaInterfaz();
                resolve(this.configIdioma);
            };
            
            document.head.appendChild(script);
        });
    }
    
    aplicarIdiomaInterfaz() {
        if (!this.configIdioma) return;
        
        console.log('Aplicando idioma a toda la interfaz:', this.configIdioma);
        
        // Actualizar título de la página
        if (this.configIdioma.sitio && Array.isArray(this.configIdioma.sitio)) {
            document.title = this.configIdioma.sitio.join(' ');
        }
        
        // Actualizar header ATI[UCV]
        const atiElement = document.querySelector('.ati-ucv');
        if (atiElement && this.configIdioma.sitio && Array.isArray(this.configIdioma.sitio)) {
            const atiText = atiElement.querySelector('.ati-text');
            const ucvBrackets = atiElement.querySelector('.ucv-brackets');
            const yearText = atiElement.querySelector('.year-text');
            
            if (atiText) atiText.textContent = this.configIdioma.sitio[0] || 'ATI';
            if (ucvBrackets) ucvBrackets.textContent = this.configIdioma.sitio[1] || '[UCV]';
            if (yearText) yearText.textContent = this.configIdioma.sitio[2] || '2025-2';
        }
        
        // Saludo del usuario
        const greetingElement = document.querySelector('.user-greeting');
        if (greetingElement) {
            if (this.configIdioma.saludo) {
                greetingElement.textContent = `${this.configIdioma.saludo}, Brandon`;
            } else if (this.configIdioma.login) {
                greetingElement.textContent = this.configIdioma.login;
            } else {
                greetingElement.textContent = 'Hola, Usuario';
            }
        }
        
        // Campo de búsqueda
        if (this.searchInput && this.configIdioma.buscar) {
            this.searchInput.placeholder = this.configIdioma.buscar + '...';
        }
        
        // Botón de búsqueda
        const searchButton = document.querySelector('.search-form button');
        if (searchButton && this.configIdioma.buscar) {
            searchButton.textContent = this.configIdioma.buscar;
        }
        
        // Footer
        const footerElement = document.querySelector('footer p');
        if (footerElement && this.configIdioma.copyRight) {
            footerElement.textContent = this.configIdioma.copyRight;
        }
    }
    
    // ========== FUNCIONES DE SESIÓN (AJAX) ==========
    
    async inicializarSesion() {
        try {
            // Llamada AJAX para obtener información de sesión
            const response = await fetch('/ATI/api/session');
            if (response.ok) {
                this.sessionData = await response.json();
                console.log('Sesión inicializada:', this.sessionData);
                this.actualizarInfoSesion();
            }
        } catch (error) {
            console.error('Error inicializando sesión:', error);
        }
    }
    
    async actualizarSesion(accion, datos = {}) {
        try {
            // Llamada AJAX para actualizar sesión
            const response = await fetch('/ATI/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: accion, ...datos })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Sesión actualizada:', result);
                await this.inicializarSesion();
                return result;
            }
        } catch (error) {
            console.error('Error actualizando sesión:', error);
        }
    }
    
    async cambiarIdioma(lang) {
        try {
            const response = await fetch('/ATI/api/language', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: lang })
            });
            
            if (response.ok) {
                // Recargar la página para aplicar nuevo idioma
                window.location.reload();
            }
        } catch (error) {
            console.error('Error cambiando idioma:', error);
        }
    }
    
    actualizarInfoSesion() {
        if (!this.sessionData || !this.sessionData.session) return;
        
        const sessionInfo = document.querySelector('.session-info');
        if (sessionInfo) {
            const session = this.sessionData.session;
            sessionInfo.textContent = `Visitas: ${session.visit_count} | Vistos: ${session.profiles_viewed_count}`;
            sessionInfo.title = `Sesión iniciada: ${new Date(session.created).toLocaleString()}`;
        }
    }
    
    // ========== FUNCIONES DE DATOS ==========
    
    cargarDatosEstudiantes() {
        // Los datos ya están cargados por el script en el HTML
        if (typeof perfiles !== 'undefined') {
            this.perfiles = perfiles;
            console.log(`${this.perfiles.length} perfiles cargados`);
        } else {
            console.error('No se encontraron datos de estudiantes');
        }
    }
    
    // ========== FUNCIONES DE IMÁGENES ==========
    
    async encontrarImagen(ci) {
        console.log(`Buscando imagen para CI: ${ci}`);
        
        const rutasBase = [
            `./${ci}/`,           // Ruta relativa
            `/ATI/${ci}/`,        // Ruta absoluta con /ATI/
            `/${ci}/`,            // Ruta absoluta sin /ATI/
        ];
        
        const formatos = ['.jpg', '.png', '.jpeg', '.JPG', '.PNG', '.JPEG'];
        const nombresPosibles = [
            ci, 
            `${ci}Grande`, 
            `${ci}Pequeña`, 
            'perfil', 
            'foto', 
            'imagen'
        ];
        
        // Función para probar imagen
        const probarImagen = (url) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        };
        
        // Probar todas las combinaciones
        for (const rutaBase of rutasBase) {
            for (const nombre of nombresPosibles) {
                for (const formato of formatos) {
                    const rutaCompleta = rutaBase + nombre + formato;
                    console.log(`Probando imagen: ${rutaCompleta}`);
                    const existe = await probarImagen(rutaCompleta);
                    if (existe) {
                        console.log(`✅ Imagen encontrada: ${rutaCompleta}`);
                        return rutaCompleta;
                    }
                }
            }
        }
        
        console.log('No se encontró imagen específica');
        return null;
    }
    
    // ========== FUNCIONES DE PERFILES INDIVIDUALES ==========
    
    async cargarPerfilIndividual(ci) {
        console.log(`Cargando perfil individual: /ATI/${ci}/perfil.json`);
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `/ATI/${ci}/perfil.json`;
            
            // Timeout para evitar esperar indefinidamente
            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout cargando perfil ${ci}`));
            }, 5000);
            
            script.onload = () => {
                clearTimeout(timeoutId);
                console.log('perfil.json cargado');
                
                let datosPerfil;
                if (typeof perfil !== 'undefined') {
                    datosPerfil = perfil;
                    console.log('Usando variable "perfil" del archivo individual');
                } else if (typeof config !== 'undefined') {
                    datosPerfil = config;
                    console.log('Usando variable "config" del archivo individual');
                } else {
                    reject(new Error('No se encontró variable con datos del perfil'));
                    return;
                }
                
                // Asegurar que el CI esté en los datos
                if (!datosPerfil.ci) {
                    datosPerfil.ci = ci;
                }
                
                resolve(datosPerfil);
            };
            
            script.onerror = () => {
                clearTimeout(timeoutId);
                console.error(`Error cargando /ATI/${ci}/perfil.json`);
                reject(new Error(`No se pudo cargar el perfil individual`));
            };
            
            document.head.appendChild(script);
        });
    }
    
    async buscarPerfilEnIndex(ci) {
        console.log(`Buscando estudiante ${ci} en datos/index.json`);
        
        return new Promise((resolve, reject) => {
            // Si ya está cargada la variable perfiles
            if (typeof perfiles !== 'undefined') {
                const estudiante = perfiles.find(p => p.ci == ci);
                if (estudiante) {
                    resolve(estudiante);
                    return;
                }
            }
            
            // Si no está cargada, cargarla
            const script = document.createElement('script');
            script.src = './datos/index.json';
            
            script.onload = () => {
                console.log('datos/index.json cargado');
                
                if (typeof perfiles === 'undefined') {
                    reject(new Error('Variable "perfiles" no definida'));
                    return;
                }
                
                const estudiante = perfiles.find(p => p.ci == ci);
                
                if (!estudiante) {
                    reject(new Error(`Estudiante con CI ${ci} no encontrado`));
                    return;
                }
                
                resolve(estudiante);
            };
            
            script.onerror = () => {
                reject(new Error('Error cargando datos/index.json'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    // ========== FUNCIONES DE VISTAS ==========
    
    mostrarListado() {
        if (!this.appContainer || !this.perfiles) return;
        
        let html = '<section class="listado-container">';
        html += '<div class="personas-container">';
        html += '<ul class="personas-lista" id="listaEstudiantes">';
        
        this.perfiles.forEach(perfil => {
            const nombre = perfil.nombre || '';
            const imagen = perfil.imagen || 'images/default.jpg';
            const ci = perfil.ci || '';
            
            let imagenSrc = imagen;
            if (!imagenSrc.startsWith('http') && !imagenSrc.startsWith('./')) {
                imagenSrc = './' + imagenSrc;
            }
            
            html += `
                <li class="persona-item" data-ci="${ci}">
                    <div class="imagen-container">
                        <img src="${imagenSrc}" alt="${nombre}" class="persona-foto imagen-grande" 
                             onerror="this.style.display='none'">
                        <img src="${imagenSrc}" alt="${nombre}" class="persona-foto imagen-pequena"
                             onerror="this.style.display='none'">
                    </div>
                    <span class="persona-nombre">${nombre}</span>
                </li>
            `;
        });
        
        html += '</ul></div></section>';
        
        this.appContainer.innerHTML = html;
        this.currentView = 'list';
        this.currentProfileId = null;
        
        // Configurar eventos de los items
        this.configurarEventosItems();
        
        // Actualizar URL sin recargar
        history.pushState({ view: 'list' }, '', `?view=list&lang=${this.obtenerParametroURL('lang') || 'es'}`);
    }
    
    async mostrarPerfil(ci) {
    console.log(`Mostrando perfil para CI: ${ci}`);
    
    // Mostrar loading
    this.appContainer.innerHTML = '<div id="loadingPerfil" style="text-align: center; padding: 50px;">Cargando perfil...</div>';
    
    try {
        let estudiante;
        let usarDatosIndividuales = false;
        
        // 1. Primero buscar información básica en perfiles cargados
        if (this.perfiles && this.perfiles.length > 0) {
            estudiante = this.perfiles.find(p => p.ci == ci);
            if (estudiante) {
                console.log('✅ Estudiante básico encontrado en perfiles cargados');
                console.log('Datos básicos:', estudiante);
                
                // Verificar si ya tenemos todos los datos necesarios
                // Si faltan campos importantes, marcamos para cargar archivo individual
                const camposRequeridos = ['descripcion', 'color', 'libro', 'musica', 'video_juego', 'lenguajes', 'email'];
                const tieneTodosCampos = camposRequeridos.every(campo => 
                    estudiante[campo] !== undefined && estudiante[campo] !== ''
                );
                
                if (!tieneTodosCampos) {
                    console.log('⚠️ Faltan campos detallados, cargando archivo individual...');
                    usarDatosIndividuales = true;
                } else {
                    console.log('✅ Ya tiene todos los campos necesarios');
                }
            }
        }
        
        // 2. Siempre intentar cargar archivo individual para obtener datos completos
        // (incluso si ya tenemos datos básicos)
        try {
            console.log('🔄 Intentando cargar archivo individual...');
            const estudianteIndividual = await this.cargarPerfilIndividual(ci);
            console.log('✅ Perfil individual cargado:', estudianteIndividual);
            
            // Si ya teníamos datos básicos, combinarlos con los individuales
            if (estudiante) {
                console.log('🔄 Combinando datos básicos con individuales...');
                estudiante = { ...estudiante, ...estudianteIndividual };
            } else {
                estudiante = estudianteIndividual;
            }
            
        } catch (error) {
            console.log('❌ No se pudo cargar archivo individual:', error.message);
            
            // Si no tenemos ningún estudiante y falló el archivo individual
            if (!estudiante) {
                // 3. Intentar cargar desde index.json directamente
                try {
                    console.log('🔄 Intentando cargar desde index.json...');
                    estudiante = await this.buscarPerfilEnIndex(ci);
                    console.log('✅ Perfil encontrado en index.json');
                } catch (error2) {
                    console.log('❌ No se pudo encontrar en index.json:', error2.message);
                }
            }
        }
        
        // Si todavía no tenemos estudiante, mostrar error
        if (!estudiante) {
            throw new Error(`Estudiante con CI ${ci} no encontrado en ninguna fuente de datos`);
        }
        
        console.log('📋 Datos finales del estudiante:', estudiante);
        
        // Registrar vista en sesión vía AJAX
        try {
            await this.actualizarSesion('view_profile', {
                ci: ci,
                nombre: estudiante.nombre
            });
        } catch (error) {
            console.log('⚠️ No se pudo registrar vista en sesión:', error.message);
        }
        
        // Buscar imagen
        console.log('🖼️ Buscando imagen...');
        const rutaImagen = await this.encontrarImagen(ci);
        console.log('Imagen encontrada:', rutaImagen);
        
        // Mostrar perfil
        console.log('🎨 Generando HTML del perfil...');
        this.appContainer.innerHTML = this.generarHTMLPerfil(estudiante, rutaImagen);
        this.currentView = 'profile';
        this.currentProfileId = ci;
        
        // Actualizar URL sin recargar
        history.pushState({ view: 'profile', ci: ci }, '', 
            `?view=profile&ci=${ci}&lang=${this.obtenerParametroURL('lang') || 'es'}`);
            
    } catch (error) {
        console.error('🚨 Error crítico cargando perfil:', error);
        
        // Mostrar error más informativo
        this.appContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1 style="color: #d32f2f;">⚠️ Error al cargar el perfil</h1>
                <p style="font-size: 1.2em; margin: 20px 0;">
                    No se pudo cargar la información para CI: <strong>${ci}</strong>
                </p>
                <p style="color: #666; margin: 10px 0;">
                    Detalles: ${error.message}
                </p>
                <div style="margin: 30px 0; padding: 20px; background: #f5f5f5; border-radius: 5px; text-align: left;">
                    <h3>Posibles causas:</h3>
                    <ul style="text-align: left; margin-left: 20px;">
                        <li>El archivo /ATI/${ci}/perfil.json no existe</li>
                        <li>El archivo JSON tiene formato incorrecto</li>
                        <li>Error de permisos en el servidor</li>
                        <li>Problema de red o CORS</li>
                    </ul>
                </div>
                <button onclick="window.atispa.navigateToList()" style="
                    display: inline-block;
                    margin-top: 30px;
                    padding: 12px 24px;
                    background: #4a6fa5;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-weight: bold;
                    cursor: pointer;
                ">
                    ← Volver al listado
                </button>
                <br><br>
                <button onclick="window.atispa.debugPerfil('${ci}')" style="
                    display: inline-block;
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: #ff9800;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">
                    🔧 Debug Detallado
                </button>
            </div>
        `;
    }
}
    
    generarHTMLPerfil(estudiante, rutaImagen = null) {
        console.log('Generando HTML para perfil:', estudiante.nombre);
        
        // Extraer datos del estudiante con compatibilidad
        const nombre = estudiante.nombre || '';
        const descripcion = estudiante.descripcion || estudiante.descripción || '';
        const correo = estudiante.correo || estudiante.email || '';
        
        // Campos con nombres compatibles
        const color_favorito = estudiante.color_favorito || estudiante.colorFavorito || estudiante.color || '';
        const libro_favorito = estudiante.libro_favorito || estudiante.libroFavorito || estudiante.libro || '';
        const musica_preferida = estudiante.musica_preferida || estudiante.musicaPreferida || estudiante.musica || '';
        
        // Manejar arrays
        let videojuegos = estudiante.videojuegos_favoritos || estudiante.videojuegosFavoritos || estudiante.video_juego || estudiante.videojuegos || '';
        if (Array.isArray(videojuegos)) {
            videojuegos = videojuegos.join(', ');
        }
        
        let lenguajes = estudiante.lenguajes_aprendidos || estudiante.lenguajesAprendidos || estudiante.lenguajes || '';
        if (Array.isArray(lenguajes)) {
            lenguajes = lenguajes.join(', ');
        }
        
        // Determinar imagen a usar
        let imagenSrc = rutaImagen || estudiante.imagen || estudiante.foto || 'images/default.jpg';
        if (imagenSrc && !imagenSrc.startsWith('http') && !imagenSrc.startsWith('./') && !imagenSrc.startsWith('/')) {
            imagenSrc = './' + imagenSrc;
        }
        
        // Aplicar etiquetas de idioma
        const etiquetas = this.configIdioma || {};
        
        // Construir HTML
        return `
            <div class="contenedor perfil-view">
                <button class="back-button" onclick="window.atispa.navigateToList()">← Volver al listado</button>
                
                <div class="imagen-container">
                    <img class="imagen imagen-grandeX" id="fotoGrande" src="${imagenSrc}" alt="Foto de perfil grande"
                         onerror="this.onerror=null; this.src='images/default.jpg'">
                    <img class="imagen imagen-pequenaX" id="fotoPequena" src="${imagenSrc}" alt="Foto de perfil pequeña"
                         onerror="this.onerror=null; this.src='images/default.jpg'">
                </div>
                
                <div class="datos-perfil">
                    <div class="perfil">
                        <h1 class="nombre" id="nombreCompleto">${nombre}</h1>
    
                        <div class="destacado">
                            <i id="descripcion">${descripcion}</i>
                        </div>
                        <div class="perfil-content">
                            <div class="campo">
                                <span class="campo-label">${etiquetas.color || 'Color Favorito'}</span>
                                <span class="campo-valor" id="colorFavorito">${color_favorito || 'No especificado'}</span>
                            </div>
                            
                            <div class="campo">
                                <span class="campo-label">${etiquetas.libro || 'Libro Favorito'}</span>
                                <span class="campo-valor" id="libroFavorito">${libro_favorito || 'No especificado'}</span>
                            </div>
                            
                            <div class="campo">
                                <span class="campo-label">${etiquetas.musica || 'Música Preferida'}</span>
                                <span class="campo-valor" id="musicaPreferida">${musica_preferida || 'No especificado'}</span>
                            </div>
                            
                            <div class="campo">
                                <span class="campo-label">${etiquetas.video_juego || 'Videojuegos Favoritos'}</span>
                                <span class="campo-valor" id="videojuegosFavoritos">${videojuegos || 'No especificado'}</span>
                            </div>
                            
                            <div class="campo campo-completo">
                                <span class="campo-label"><strong>${etiquetas.lenguajes || 'Lenguajes Aprendidos'}</strong></span>
                                <span class="campo-valor" id="lenguajesAprendidos">${lenguajes || 'No especificado'}</span>
                            </div>
                            
                            <div class="campo campo-completo">
                                <span class="campo-label">${etiquetas.email || 'Si necesitan comunicarse conmigo me pueden escribir a:'}</span>
                                <span class="campo-valor">
                                    ${correo ? 
                                        `<a class="email-link" id="emailLink" href="mailto:${correo}">${correo}</a>` :
                                        'No disponible'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    navigateToList() {
        this.mostrarListado();
    }
    
    // ========== FUNCIONES DE BÚSQUEDA ==========
    
    buscarEstudiantes(termino) {
        if (!this.perfiles || !this.appContainer) return;
        
        if (!termino) {
            this.mostrarListado();
            return;
        }
        
        const resultados = this.perfiles.filter(estudiante =>
            estudiante.nombre.toLowerCase().includes(termino.toLowerCase())
        );
        
        this.mostrarResultadosBusqueda(resultados);
    }
    
    mostrarResultadosBusqueda(resultados) {
        const listaContainer = this.appContainer.querySelector('#listaEstudiantes');
        if (!listaContainer) return;
        
        if (resultados.length === 0) {
            const mensaje = this.configIdioma?.noResultados || 'No hay alumnos que tengan en su nombre: [query]';
            listaContainer.innerHTML = `<li class="no-results">${mensaje.replace('[query]', '')}</li>`;
            return;
        }
        
        let html = '';
        resultados.forEach(perfil => {
            const nombre = perfil.nombre || '';
            const imagen = perfil.imagen || 'images/default.jpg';
            const ci = perfil.ci || '';
            
            let imagenSrc = imagen;
            if (!imagenSrc.startsWith('http') && !imagenSrc.startsWith('./')) {
                imagenSrc = './' + imagenSrc;
            }
            
            html += `
                <li class="persona-item" data-ci="${ci}">
                    <div class="imagen-container">
                        <img src="${imagenSrc}" alt="${nombre}" class="persona-foto imagen-grande" 
                             onerror="this.style.display='none'">
                        <img src="${imagenSrc}" alt="${nombre}" class="persona-foto imagen-pequena"
                             onerror="this.style.display='none'">
                    </div>
                    <span class="persona-nombre">${nombre}</span>
                </li>
            `;
        });
        
        listaContainer.innerHTML = html;
        this.configurarEventosItems();
    }
    
    // ========== FUNCIONES DE EVENTOS ==========
    
    configurarEventos() {
        // Formulario de búsqueda
        if (this.searchForm && this.searchInput) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.buscarEstudiantes(this.searchInput.value.trim());
            });
            
            this.searchInput.addEventListener('input', (e) => {
                this.buscarEstudiantes(e.target.value.trim());
            });
        }
        
        // Manejar navegación del navegador
        window.addEventListener('popstate', (e) => {
            this.manejarNavegacionURL();
        });
        
        // Selector de idioma opcional
        const langSelector = document.getElementById('langSelector');
        if (langSelector) {
            langSelector.addEventListener('change', (e) => {
                this.cambiarIdioma(e.target.value);
            });
        }
    }
    
    configurarEventosItems() {
        const items = document.querySelectorAll('.persona-item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const ci = item.dataset.ci;
                if (ci) {
                    this.mostrarPerfil(ci);
                }
            });
        });
    }
    
    manejarNavegacionURL() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view');
        const ci = params.get('ci');
        
        console.log('Manejando navegación URL:', { view, ci });
        
        if (view === 'profile' && ci) {
            this.mostrarPerfil(ci);
        } else {
            this.mostrarListado();
        }
    }
    
    // ========== FUNCIONES DE ERROR ==========
    
    mostrarError(mensaje) {
        console.error('Error:', mensaje);
        
        if (this.appContainer) {
            const lang = this.obtenerParametroURL('lang') || 'es';
            this.appContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h1 style="color: #d32f2f;">⚠️ Error</h1>
                    <p style="font-size: 1.2em; margin: 20px 0;">${mensaje}</p>
                    <button onclick="window.atispa.navigateToList()" style="
                        display: inline-block;
                        margin-top: 30px;
                        padding: 12px 24px;
                        background: #4a6fa5;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-weight: bold;
                        cursor: pointer;
                    ">
                        ← Volver al listado
                    </button>
                </div>
            `;
        }
    }
}

// ========== INICIALIZACIÓN ==========

// Crear instancia global
window.atispa = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando SPA...');
    window.atispa = new ATISPA();
});

// Debug adicional
console.log('=== SPA.JS CARGADO ===');
console.log('Variable perfiles disponible?', typeof perfiles);
if (typeof perfiles !== 'undefined') {
    console.log('Número de perfiles cargados:', perfiles.length);
}