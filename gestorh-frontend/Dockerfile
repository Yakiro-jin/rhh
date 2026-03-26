# Usamos una imagen basada en Debian (bullseye) en lugar de Alpine para mayor compatibilidad
FROM node:18-bullseye-slim

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias (opcional pero recomendado en bullseye-slim)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias (con legacy-peer-deps por React 18/19 y posibles conflictos)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Variables de entorno para el build
# GENERATE_SOURCEMAP=false reduce drásticamente el uso de memoria RAM durante el build
ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV CI=false

# Construir la app para producción
RUN npm run build

# Servir con un servidor ligero
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

EXPOSE 3000