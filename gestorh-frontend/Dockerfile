# Imagen base de Node
FROM node:20-alpine

# Directorio de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias (con legacy-peer-deps por React 19)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir la app para producción
# CI=false evita que los warnings detengan el build
# Aumentamos memoria para evitar crasheos en servidores pequeños
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN CI=false npm run build

# Servir con un servidor ligero
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]

EXPOSE 3000