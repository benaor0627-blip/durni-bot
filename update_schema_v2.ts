import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateSchema() {
  try {
    // 1. Alter progreso_estudiantes
    // Eliminar restricción única antigua si existe (normalmente el nombre por defecto es el nombre de la tabla + columna + key)
    console.log('Actualizando progreso_estudiantes...');
    await pool.query(`
      ALTER TABLE progreso_estudiantes DROP CONSTRAINT IF EXISTS progreso_estudiantes_estudiante_id_key;
    `);

    // Añadir columna de ultima actualización si no existe
    await pool.query(`
      ALTER TABLE progreso_estudiantes ADD COLUMN IF NOT EXISTS ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // Añadir restricción única compuesta (un estudiante puede tener un solo progreso activo POR curso)
    await pool.query(`
      ALTER TABLE progreso_estudiantes ADD CONSTRAINT progreso_estudiantes_estudiante_curso_unique UNIQUE (estudiante_id, curso_id);
    `);

    // 2. Crear tabla de resultados_microtest
    console.log('Creando tabla resultados_microtest...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resultados_microtest (
        id SERIAL PRIMARY KEY,
        estudiante_id INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
        curso_id INTEGER NOT NULL,
        fase_id INTEGER NOT NULL,
        capsula_id INTEGER NOT NULL,
        pregunta_idx INTEGER NOT NULL,
        intentos INTEGER DEFAULT 1,
        es_correcto BOOLEAN DEFAULT FALSE,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (estudiante_id, curso_id, fase_id, capsula_id, pregunta_idx)
      );
    `);

    console.log('✅ Esquema actualizado exitosamente con soporte multi-curso y seguimiento de microtests.');
  } catch (err) {
    console.error('❌ Error actualizando esquema:', err);
  } finally {
    await pool.end();
  }
}

updateSchema();
