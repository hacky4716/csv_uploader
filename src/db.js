import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';


const { Pool } = pkg;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });


export const pool = new Pool({
user: process.env.PGUSER,
password: process.env.PGPASSWORD,
host: process.env.PGHOST,
port: process.env.PGPORT,
database: process.env.PGDATABASE,
});


export async function initDB() {
try {
await pool.query(`CREATE TABLE IF NOT EXISTS public.users (
id serial4 PRIMARY KEY,
"name" varchar NOT NULL,
age int4 NOT NULL,
address jsonb NULL,
additional_info jsonb NULL
);`);
console.log('Database initialized successfully');
} catch (err) {
console.error('Database initialization failed:', err);
throw err;
}
}