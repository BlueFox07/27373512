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

# 3. Crear estructura ATI
RUN mkdir -p /var/www/html/ATI

# 4. Clonar repositorio DENTRO DE ATI
WORKDIR /var/www/html
# Opción A: Si tu repo tiene todo en raíz, muevelo a ATI/
RUN git clone --branch reto-7 https://github.com/BlueFox07/27373512.git temp-repo && \
    mv temp-repo/* ATI/ && \
    mv temp-repo/.* ATI/ 2>/dev/null || true && \
    rm -rf temp-repo

# 5. VERIFICAR ESTRUCTURA
RUN echo "=== Estructura en /var/www/html ===" && ls -la && \
    echo "=== Contenido de ATI/ ===" && ls -la ATI/

# 6. Configurar Apache con TU ati.conf
COPY ati.conf /etc/apache2/sites-available/ati.conf

# 7. Habilitar sitio
RUN a2ensite ati.conf

# 8. Permisos
RUN chown -R www-data:www-data /var/www/html/ATI
RUN find /var/www/html/ATI -name "*.py" -exec chmod +x {} \;

EXPOSE 80
CMD ["apache2ctl", "-D", "FOREGROUND"]