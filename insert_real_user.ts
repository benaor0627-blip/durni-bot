import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const insertRealStudent = async () => {
  try {
    console.log('Insertando número real del usuario...');
    await pool.query(`
      INSERT INTO estudiantes (nombre, apellido, celular, cedula, departamento, municipio)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (celular) DO UPDATE SET nombre = $1, apellido = $2;
    `, ['Mateo', 'Dúrnico', '573115702414', '987654321', 'Colombia', 'Principal']);
    console.log('Número registrado con éxito.');
  } catch (err) {
    console.error('Error al registrar número:', err);
  } finally {
    await pool.end();
  }
};

insertRealStudent();
