# Usamos una imagen basada en Debian (bullseye) para máxima compatibilidad
FROM node:18-bullseye-slim

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache y realizar instalación limpia
# Usamos --legacy-peer-deps para evitar conflictos de versiones de React
RUN npm cache clean --force && \
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Variables de entorno críticas para el build
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV CI=false

# Construir la aplicación
RUN npm run build

# Instalamos un servidor de producción ligero
RUN npm install -g serve

# Exponemos el puerto
EXPOSE 3000

# Comando para arrancar la app
CMD ["serve", "-s", "build", "-l", "3000"]