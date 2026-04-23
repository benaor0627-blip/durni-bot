-- Esquema inicial para la base de datos de Durni (Neon/PostgreSQL)

CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    celular VARCHAR(20) UNIQUE NOT NULL, -- El número con el que WhatsApp validará
    cedula VARCHAR(20) UNIQUE NOT NULL,
    departamento VARCHAR(100),
    municipio VARCHAR(100),
    direccion TEXT,
    correo_electronico VARCHAR(150),
    link_instagram VARCHAR(255),
    link_tiktok VARCHAR(255),
    productos_finca TEXT, -- Lista de productos producidos
    cantidad_produccion VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para gestionar el progreso de los estudiantes en los cursos
CREATE TABLE progreso_estudiantes (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id),
    curso_id VARCHAR(50) NOT NULL,
    fase_actual INTEGER DEFAULT 1,
    capsula_actual INTEGER DEFAULT 1,
    completado BOOLEAN DEFAULT FALSE,
    ultima_interaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar los resultados de los microtests
CREATE TABLE resultados_microtests (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES estudiantes(id),
    curso_id VARCHAR(50),
    fase INTEGER,
    capsula INTEGER,
    puntaje INTEGER,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
