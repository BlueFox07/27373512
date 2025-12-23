#!/usr/bin/env python3
"""
index.py - SPA para ATI con sesiones, cookies y AJAX
"""

import json
import urllib.parse
import os
import uuid
from datetime import datetime
from http.cookies import SimpleCookie

# ========== SESIONES EN MEMORIA ==========
sesiones_activas = {}

def obtener_o_crear_sesion(cookies):
    """Obtener sesión existente o crear nueva"""
    session_id = cookies.get('ati_session_id')
    
    if session_id in sesiones_activas:
        return sesiones_activas[session_id]
    else:
        nuevo_id = str(uuid.uuid4())
        nueva_sesion = {
            'id': nuevo_id,
            'lang': 'es',
            'visit_count': 0,
            'created': datetime.now().isoformat(),
            'profiles_viewed': [],
            'last_activity': datetime.now().isoformat()
        }
        sesiones_activas[nuevo_id] = nueva_sesion
        return nueva_sesion

def actualizar_sesion(session):
    """Actualizar última actividad de sesión"""
    session['last_activity'] = datetime.now().isoformat()
    session['visit_count'] = session.get('visit_count', 0) + 1

# ========== FUNCIONES AUXILIARES ==========

def parse_cookies(environ):
    """Parsear cookies del header HTTP"""
    cookies = {}
    cookie_header = environ.get('HTTP_COOKIE', '')
    if cookie_header:
        try:
            cookie = SimpleCookie()
            cookie.load(cookie_header)
            for key, morsel in cookie.items():
                cookies[key] = morsel.value
        except:
            # Fallback simple
            for cookie in cookie_header.split(';'):
                if '=' in cookie:
                    key, value = cookie.strip().split('=', 1)
                    cookies[key] = urllib.parse.unquote(value)
    return cookies

def parse_query_string(query_string):
    """Parsear parámetros de la URL"""
    params = {}
    if query_string:
        for param in query_string.split('&'):
            if '=' in param:
                key, value = param.split('=', 1)
                params[key] = urllib.parse.unquote(value)
    return params

def cargar_perfiles():
    """Cargar todos los perfiles"""
    try:
        with open('datos/index.json', 'r', encoding='utf-8') as f:
            contenido = f.read()
            # Manejar tanto JSON puro como JS con variable
            if contenido.strip().startswith('const perfiles'):
                # Extraer JSON del JS
                inicio = contenido.find('[')
                fin = contenido.rfind(']') + 1
                json_str = contenido[inicio:fin]
                return json.loads(json_str)
            else:
                return json.loads(contenido)
    except Exception as e:
        print(f"Error cargando perfiles: {e}")
        return []

def obtener_estudiante(ci):
    """Buscar estudiante específico"""
    perfiles = cargar_perfiles()
    for perfil in perfiles:
        if str(perfil.get('ci')) == str(ci):
            return perfil
    return None

def generar_html_base(lang='es'):
    """Generar HTML base del SPA (solo una página)"""
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="./favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="./favicon.ico" type="image/x-icon">
    
    <!-- Cargar configuración de idioma -->
    <script src="./conf/config{lang.upper()}.json"></script>
    
    <!-- Cargar datos de estudiantes -->
    <script src="./datos/index.json"></script>
    
    <!-- JavaScript del SPA -->
    <script src="./js/spa.js"></script>
    
    <title>ATI[UCV] 2025-2 - SPA</title>
    <link rel="stylesheet" href="./css/style.css">
</head>
<body>
    <!-- Header fijo -->
    <header>
        <nav>
            <ul class="nav-links">
                <li><div class="ati-ucv">
                    <span class="ati-text">ATI</span>
                    <span class="ucv-brackets">[UCV]</span>
                    <span class="year-text">2025-2</span>
                </div></li>
                <li><div class="user-greeting" id="userGreeting">Hola</div></li>
                <li>
                    <form class="search-form" id="searchForm">
                        <input type="text" placeholder="Buscar..." aria-label="Campo de búsqueda" id="searchInput">
                        <button type="submit">Buscar</button>
                    </form>
                </li>
            </ul>   
        </nav>
    </header>
    
    <!-- Contenido dinámico -->
    <main id="app">
        <!-- Aquí se cargará dinámicamente el contenido -->
        <div id="loading">Cargando aplicación...</div>
    </main>
    
    <!-- Footer fijo -->
    <footer>
        <p id="footerText">Copyright © 2025 Escuela de computación - ATI</p>
    </footer>
    
    <!-- Script para inicializar el SPA -->
    <script>
        // Inicializar SPA con idioma
        window.SPA_CONFIG = {{
            lang: "{lang}",
            baseUrl: window.location.pathname.replace(/index\\.py$/, '')
        }};
    </script>
</body>
</html>'''

def generar_html_listado(perfiles, lang='es'):
    """Generar HTML para el listado de estudiantes"""
    html = '''
    <section class="listado-container">
        <div class="personas-container">
            <ul class="personas-lista" id="listaEstudiantes">
    '''
    
    for perfil in perfiles:
        nombre = perfil.get('nombre', '')
        imagen = perfil.get('imagen', 'images/default.jpg')
        ci = perfil.get('ci', '')
        
        if not imagen.startswith('http') and not imagen.startswith('./'):
            imagen = './' + imagen
            
        html += f'''
                <li class="persona-item" data-ci="{ci}">
                    <div class="imagen-container">
                        <img src="{imagen}" alt="{nombre}" class="persona-foto imagen-grande" 
                             onerror="this.style.display='none'">
                        <img src="{imagen}" alt="{nombre}" class="persona-foto imagen-pequena"
                             onerror="this.style.display='none'">
                    </div>
                    <span class="persona-nombre">{nombre}</span>
                </li>
        '''
    
    html += '''
            </ul>
        </div>
    </section>
    '''
    
    return html

def generar_html_perfil(estudiante, lang='es'):
    """Generar HTML para el perfil de un estudiante"""
    if not estudiante:
        return '<div class="error">Estudiante no encontrado</div>'
    
    nombre = estudiante.get('nombre', '')
    descripcion = estudiante.get('descripcion', '')
    imagen = estudiante.get('imagen', 'images/default.jpg')
    correo = estudiante.get('correo', estudiante.get('email', ''))
    ci = estudiante.get('ci', '')
    
    # Campos con compatibilidad
    color_favorito = estudiante.get('color_favorito', estudiante.get('colorFavorito', estudiante.get('color', '')))
    libro_favorito = estudiante.get('libro_favorito', estudiante.get('libroFavorito', estudiante.get('libro', '')))
    musica_preferida = estudiante.get('musica_preferida', estudiante.get('musicaPreferida', estudiante.get('musica', '')))
    
    # Manejar arrays
    videojuegos = estudiante.get('videojuegos_favoritos', estudiante.get('videojuegosFavoritos', estudiante.get('video_juego', '')))
    if isinstance(videojuegos, list):
        videojuegos = ', '.join(videojuegos)
    
    lenguajes = estudiante.get('lenguajes_aprendidos', estudiante.get('lenguajesAprendidos', estudiante.get('lenguajes', '')))
    if isinstance(lenguajes, list):
        lenguajes = ', '.join(lenguajes)
    
    # Asegurar ruta de imagen
    if not imagen.startswith('http') and not imagen.startswith('./'):
        imagen = './' + imagen
    
    return f'''
    <div class="contenedor perfil-view">
        <button class="back-button" onclick="spa.navigateToList()">← Volver al listado</button>
        
        <div class="imagen-container">
            <img class="imagen imagen-grandeX" id="fotoGrande" src="{imagen}" alt="Foto de perfil grande"
                 onerror="this.style.display='none'">
            <img class="imagen imagen-pequenaX" id="fotoPequena" src="{imagen}" alt="Foto de perfil pequeña"
                 onerror="this.style.display='none'">
        </div>
        
        <div class="datos-perfil">
            <div class="perfil">
                <h1 class="nombre" id="nombreCompleto">{nombre}</h1>
    
                <div class="destacado">
                    <i id="descripcion">{descripcion}</i>
                </div>
                <div class="perfil-content">
                    <div class="campo">
                        <span class="campo-label">Color Favorito</span>
                        <span class="campo-valor" id="colorFavorito">{color_favorito}</span>
                    </div>
                    
                    <div class="campo">
                        <span class="campo-label">Libro Favorito</span>
                        <span class="campo-valor" id="libroFavorito">{libro_favorito}</span>
                    </div>
                    
                    <div class="campo">
                        <span class="campo-label">Música Preferida</span>
                        <span class="campo-valor" id="musicaPreferida">{musica_preferida}</span>
                    </div>
                    
                    <div class="campo">
                        <span class="campo-label">Videojuegos Favoritos</span>
                        <span class="campo-valor" id="videojuegosFavoritos">{videojuegos}</span>
                    </div>
                    
                    <div class="campo campo-completo">
                        <span class="campo-label"><strong>Lenguajes Aprendidos</strong></span>
                        <span class="campo-valor" id="lenguajesAprendidos">{lenguajes}</span>
                    </div>
                    
                    <div class="campo campo-completo">
                        <span class="campo-label">Si necesitan comunicarse conmigo me pueden escribir a:</span>
                        <span class="campo-valor">
                            <a class="email-link" id="emailLink" href="mailto:{correo}">{correo}</a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    '''

# ========== APLICACIÓN WSGI ==========

def application(environ, start_response):
    """Aplicación WSGI - SPA con sesiones y API AJAX"""
    
    method = environ.get('REQUEST_METHOD', 'GET')
    path = environ.get('PATH_INFO', '')
    query_string = environ.get('QUERY_STRING', '')
    
    # Parsear cookies
    cookies = parse_cookies(environ)
    
    # Obtener o crear sesión
    session = obtener_o_crear_sesion(cookies)
    
    # Determinar idioma
    params = parse_query_string(query_string)
    lang = params.get('lang') or cookies.get('lang') or session.get('lang', 'es')
    session['lang'] = lang
    
    # Actualizar sesión
    actualizar_sesion(session)
    
    # Headers base con cookies
    headers = [
        ('Content-Type', 'text/html; charset=utf-8'),
        ('Set-Cookie', f'lang={lang}; Path=/; Max-Age=2592000; SameSite=Lax'),
        ('Set-Cookie', f'ati_session_id={session["id"]}; Path=/; Max-Age=3600; SameSite=Lax; HttpOnly'),
    ]
    
    # ========== RUTAS API AJAX (para sesiones/cookies) ==========
    
    if path == '/ATI/api/session' or path.endswith('/api/session'):
        if method == 'GET':
            # Obtener información de sesión
            response_data = {
                'success': True,
                'session': {
                    'id': session['id'],
                    'lang': session['lang'],
                    'visit_count': session['visit_count'],
                    'profiles_viewed_count': len(session.get('profiles_viewed', [])),
                    'created': session.get('created'),
                    'last_activity': session.get('last_activity')
                }
            }
            
            start_response('200 OK', [
                ('Content-Type', 'application/json'),
                ('Set-Cookie', f'ati_session_id={session["id"]}; Path=/; Max-Age=3600; HttpOnly')
            ])
            return [json.dumps(response_data).encode('utf-8')]
            
        elif method == 'POST':
            # Actualizar sesión (ej: registrar vista de perfil)
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                if content_length > 0:
                    body = environ['wsgi.input'].read(content_length)
                    data = json.loads(body.decode('utf-8'))
                    
                    action = data.get('action', '')
                    
                    if action == 'view_profile':
                        ci = data.get('ci')
                        nombre = data.get('nombre')
                        
                        if ci and nombre:
                            if 'profiles_viewed' not in session:
                                session['profiles_viewed'] = []
                            
                            # Evitar duplicados recientes
                            if not any(p.get('ci') == ci for p in session['profiles_viewed'][-10:]):
                                session['profiles_viewed'].append({
                                    'ci': ci,
                                    'nombre': nombre,
                                    'timestamp': datetime.now().isoformat()
                                })
                    
                    response_data = {'success': True, 'message': 'Sesión actualizada'}
                else:
                    response_data = {'success': False, 'error': 'Datos inválidos'}
                    
            except Exception as e:
                response_data = {'success': False, 'error': str(e)}
            
            start_response('200 OK', [
                ('Content-Type', 'application/json'),
                ('Set-Cookie', f'ati_session_id={session["id"]}; Path=/; Max-Age=3600; HttpOnly')
            ])
            return [json.dumps(response_data).encode('utf-8')]
    
    elif path == '/ATI/api/language' or path.endswith('/api/language'):
        # Cambiar idioma
        if method == 'POST':
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                if content_length > 0:
                    body = environ['wsgi.input'].read(content_length)
                    data = json.loads(body.decode('utf-8'))
                    
                    new_lang = data.get('lang', 'es')
                    if new_lang in ['es', 'en', 'pt']:
                        session['lang'] = new_lang
                        response_data = {'success': True, 'lang': new_lang}
                    else:
                        response_data = {'success': False, 'error': 'Idioma no válido'}
                else:
                    response_data = {'success': False, 'error': 'Datos inválidos'}
                    
            except Exception as e:
                response_data = {'success': False, 'error': str(e)}
            
            headers = [
                ('Content-Type', 'application/json'),
                ('Set-Cookie', f'lang={session["lang"]}; Path=/; Max-Age=2592000; SameSite=Lax'),
                ('Set-Cookie', f'ati_session_id={session["id"]}; Path=/; Max-Age=3600; HttpOnly')
            ]
            start_response('200 OK', headers)
            return [json.dumps(response_data).encode('utf-8')]
    
    # ========== RUTA PRINCIPAL DEL SPA ==========
    elif path in ['', '/', '/ATI/', '/ATI/index.py']:
        # Servir la página SPA base
        html = generar_html_base(lang)
        start_response('200 OK', headers)
        return [html.encode('utf-8')]
    
    # ========== SERVIR ARCHIVOS ESTÁTICOS ==========
    elif any(path.endswith(ext) for ext in ['.css', '.js', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif']):
        # Servir archivos estáticos
        filepath = path.lstrip('/')
        if filepath.startswith('ATI/'):
            filepath = filepath[4:]
        
        try:
            with open(filepath, 'rb') as f:
                content = f.read()
            
            # Determinar tipo MIME
            if path.endswith('.css'):
                content_type = 'text/css'
            elif path.endswith('.js'):
                content_type = 'application/javascript'
            elif path.endswith('.json'):
                content_type = 'application/json'
            elif path.endswith('.ico'):
                content_type = 'image/x-icon'
            elif path.endswith('.png'):
                content_type = 'image/png'
            elif path.endswith('.jpg') or path.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif path.endswith('.gif'):
                content_type = 'image/gif'
            else:
                content_type = 'text/plain'
            
            start_response('200 OK', [('Content-Type', content_type)])
            return [content]
        except FileNotFoundError:
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'Archivo no encontrado']
    
    # ========== RUTA NO ENCONTRADA ==========
    else:
        start_response('404 Not Found', [('Content-Type', 'text/html')])
        return [b'<h1>404 - Pagina no encontrada</h1>']

# ========== EJECUCIÓN DIRECTA ==========

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    
    print("=" * 60)
    print("ATI - SPA con sesiones HTTP y cookies")
    print("=" * 60)
    print("URL principal:")
    print("  • http://localhost:8000/ATI/index.py")
    print("")
    print("Endpoints API (AJAX exclusivo para sesiones/cookies):")
    print("  • GET  /ATI/api/session    - Obtener info de sesión")
    print("  • POST /ATI/api/session    - Actualizar sesión")
    print("  • POST /ATI/api/language   - Cambiar idioma")
    print("")
    print("Características SPA:")
    print("  • Solo una página HTML")
    print("  • Navegación cliente-side sin recargar")
    print("  • Sesiones con cookies HttpOnly")
    print("  • AJAX solo para gestión de sesión")
    print("=" * 60)
    
    server = make_server('localhost', 8000, application)
    server.serve_forever()