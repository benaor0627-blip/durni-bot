import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const runSetup = async () => {
  try {
    const schemaSql = fs.readFileSync('./docs/schema.sql', 'utf8');
    console.log('Ejecutando schema.sql...');
    await pool.query(schemaSql);
    console.log('Tablas creadas con éxito.');
  } catch (err) {
    console.error('Error al configurar la base de datos:', err);
  } finally {
    await pool.end();
  }
};

runSetup();
