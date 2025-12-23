FROM ubuntu:latest

# 1. Instalar dependencias
RUN apt-get update && apt-get install -y \
    apache2 \
    python3 \
    python3-pip \
    git \
    libapache2-mod-wsgi-py3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Configurar Apache
RUN a2enmod wsgi rewrite
RUN a2dissite 000-default.conf

# 3. Crear estructura de directorios
RUN mkdir -p /var/www/html

# 4. Clonar repositorio EN LA RAÍZ
WORKDIR /var/www
RUN git clone --branch reto-7 https://github.com/BlueFox07/27373512.git html

# 5. VERIFICAR ESTRUCTURA (Debug)
RUN echo "=== Archivos clonados ===" && ls -la /var/www/html/

# 6. Configurar Apache (ati.conf debe apuntar a /var/www/html)
COPY ati.conf /etc/apache2/sites-available/ati.conf

# 7. Habilitar sitio
RUN a2ensite ati.conf

# 8. Permisos
RUN chown -R www-data:www-data /var/www/html
RUN find /var/www/html -name "*.py" -exec chmod +x {} \;

EXPOSE 80
CMD ["apache2ctl", "-D", "FOREGROUND"]