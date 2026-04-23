import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const updateSchema = async () => {
  try {
    console.log('Añadiendo restricción UNIQUE a progreso_estudiantes...');
    await pool.query('ALTER TABLE progreso_estudiantes ADD CONSTRAINT unique_estudiante_curso UNIQUE (estudiante_id);');
    console.log('Restricción añadida con éxito.');
  } catch (err) {
    console.error('Error al actualizar el esquema:', err);
  } finally {
    await pool.end();
  }
};

updateSchema();
