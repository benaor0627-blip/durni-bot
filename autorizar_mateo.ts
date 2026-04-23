import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function autorizarUsuario() {
  const query = `
    INSERT INTO estudiantes (nombre, apellido, celular, cedula)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (celular) DO UPDATE SET nombre = EXCLUDED.nombre;
  `;
  try {
    await pool.query(query, ['Mateo', 'Durni', '573134912043', '3134912043']);
    console.log('✅ ¡AUTORIZADO! Mateo Durni (+573134912043) ya está en el sistema.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

autorizarUsuario();
