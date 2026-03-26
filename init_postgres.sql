-- 1. Creación de la base de datos (En Postgres se suele crear antes, pero aquí dejamos la estructura)
-- CREATE DATABASE IF NOT EXISTS gestorh;
-- \c gestorh;

-- 2. Tabla de Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT
);

-- 3. Tabla de Cargos
CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INT,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL
);

-- 4. Tabla de Empleados (Ficha Maestra)
CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email_personal VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    fecha_ingreso DATE NOT NULL,
    cargo_id INT,
    departamento_id INT,
    estatus VARCHAR(20) CHECK (estatus IN ('activo', 'inactivo')) DEFAULT 'activo',
    FOREIGN KEY (cargo_id) REFERENCES cargos(id),
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
);

-- 5. Tabla de Usuarios (Seguridad y Roles)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    empleado_id INT NOT NULL, 
    rol VARCHAR(20) CHECK (rol IN ('admin', 'supervisor')) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- 6. Tabla de Amonestaciones
CREATE TABLE IF NOT EXISTS amonestaciones (
    id SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('leve', 'grave', 'muy_grave')) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_incidencia DATE NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notificado_n8n BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (supervisor_id) REFERENCES usuarios(id)
);

-- 7. Tabla de Evaluaciones de Desempeño
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL,
    evaluador_id INT NOT NULL,
    periodo_mes VARCHAR(20) NOT NULL, 
    puntaje_total DECIMAL(5,2) NOT NULL, 
    comentarios_jefe TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sugerencia_capacitacion TEXT, 
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (evaluador_id) REFERENCES usuarios(id)
);

-- 8. Tabla de Capacitaciones
CREATE TABLE IF NOT EXISTS capacitaciones (
    id SERIAL PRIMARY KEY,
    nombre_curso VARCHAR(150) NOT NULL,
    descripcion TEXT,
    area_mejora VARCHAR(100), 
    fecha_programada DATE
);

-- 9. Relación Empleados - Capacitaciones
CREATE TABLE IF NOT EXISTS empleado_capacitacion (
    id SERIAL PRIMARY KEY,
    empleado_id INT,
    capacitacion_id INT,
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado DATE,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id),
    FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones(id)
);

-- 10. INSERT DE SEMILLA
INSERT INTO departamentos (nombre, descripcion) VALUES ('RRHH', 'Recursos Humanos y Administración') ON CONFLICT DO NOTHING;
INSERT INTO cargos (nombre, departamento_id) VALUES ('Gerente de RRHH', 1) ON CONFLICT DO NOTHING;
INSERT INTO empleados (cedula, nombre, apellido, email_personal, fecha_ingreso, cargo_id, departamento_id) 
VALUES ('V-000001', 'Admin', 'Principal', 'admin@sunsol.com', CURRENT_DATE, 1, 1) ON CONFLICT DO NOTHING;
INSERT INTO usuarios (username, password, email, empleado_id, rol, activo) 
VALUES ('admin', '$2a$12$YcqRmidFyAf1tG/bF8dAKOBgBSAnlWX/qa8O14Tat9o6wco29siJS', 'admin@sunsol.com', 1, 'admin', TRUE) ON CONFLICT DO NOTHING;
