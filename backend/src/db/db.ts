// c:\Coding\OpenCafe\cafe-pos\backend\src\db\db.ts
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '../.env' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? 'cafe_pos',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
      },
);

export async function query<T>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}

