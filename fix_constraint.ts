import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await pool.query(`ALTER TABLE progreso_estudiantes DROP CONSTRAINT IF EXISTS unique_estudiante_curso;`);
  console.log('Constraint removed.');
  await pool.end();
}
run();
