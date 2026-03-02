// c:\Coding\OpenCafe\cafe-pos\backend\src\db\migrate.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from './db';

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, '../../migrations');
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    console.log(`Applied migration: ${file}`);
  }
}

runMigrations()
  .catch((error) => {
    console.error('Migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

