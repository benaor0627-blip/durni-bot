import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const insertStudent = async () => {
  try {
    console.log('Insertando estudiante de prueba...');
    await pool.query(`
      INSERT INTO estudiantes (nombre, apellido, celular, cedula, departamento, municipio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (celular) DO NOTHING;
    `, ['Test', 'Durni', '573000000000', '123456789', 'Antioquia', 'Medellín']);
    console.log('Estudiante insertado con éxito (o ya existía).');
  } catch (err) {
    console.error('Error al insertar estudiante:', err);
  } finally {
    await pool.end();
  }
};

insertStudent();
