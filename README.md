# GestoRH - Sistema de Gestión de Recursos Humanos

Sistema integral para la gestión de personal, evaluaciones de desempeño, amonestaciones y capacitaciones.

## 🚀 Credenciales de Acceso Inicial
Para ingresar al sistema por primera vez, utiliza los siguientes datos:

- **Correo Electrónico**: `admin@sunsol.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador

---

## 🛠️ Configuración para Portainer (Stack)

Si estás desplegando el proyecto en un servidor Ubuntu con Portainer, sigue estos pasos:

### 1. Preparar la Base de Datos
Asegúrate de ejecutar el archivo `init_postgres.sql` en tu servidor PostgreSQL externo (`192.168.100.100`).

### 2. Variables de Entorno (.env)
Configura las siguientes variables en la sección "Environment variables" de tu Stack en Portainer:

```env
DB_HOST=192.168.100.100
DB_PORT=5432
DB_NAME=gestorh
DB_USER=postgres
DB_PASSWORD=123456
N8N_API_URL=http://gestorh-n8n:5678
```

### 3. Puertos de Acceso
Una vez desplegado, el sistema estará disponible en:

- **Frontend**: `http://tu-ip-servidor:3005`
- **Backend (API)**: `http://tu-ip-servidor:5005`
- **n8n**: `http://tu-ip-servidor:5679`

---

## 📂 Estructura del Proyecto
- `gestorh-frontend/`: Aplicación React (Interfaz de usuario).
- `gestorh-backend/`: API Flask (Lógica de negocio y conexión a DB).
- `docker-compose.yml`: Orquestación de contenedores.
- `init_postgres.sql`: Script de inicialización de la base de datos.

---

## 📝 Notas de Desarrollo
- El frontend está optimizado para evitar errores de construcción en Linux mediante nombres de archivos estrictos.
- Se utiliza **Node 20** en el contenedor del frontend para máxima estabilidad.
- La comunicación entre el frontend y el backend se realiza a través del puerto `5005`.
