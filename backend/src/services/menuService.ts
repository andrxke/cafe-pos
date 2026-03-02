// c:\Coding\OpenCafe\cafe-pos\backend\src\services\menuService.ts
import type { CreateMenuItemInput, MenuItem, UpdateMenuItemInput } from '../types/entities';
import { AppError } from '../middleware/errorHandler';
import { pool, query } from '../db/db';

export async function listMenuItems() {
  const result = await query<MenuItem>(
    `SELECT id, name, description, price, category, is_available, created_at, updated_at
     FROM menu_items
     ORDER BY category, name`,
  );

  return result.rows;
}

export async function createMenuItem(input: CreateMenuItemInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query<MenuItem>(
      `INSERT INTO menu_items (name, description, price, category, is_available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, price, category, is_available, created_at, updated_at`,
      [
        input.name.trim(),
        input.description?.trim() ?? null,
        input.price,
        input.category.trim(),
        input.is_available ?? true,
      ],
    );

    await client.query(
      `INSERT INTO inventory (menu_item_id, quantity_in_stock, unit, low_stock_threshold)
       VALUES ($1, 0, 'units', 5)`,
      [result.rows[0].id],
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateMenuItem(id: number, input: UpdateMenuItemInput) {
  const fields: string[] = [];
  const values: unknown[] = [];

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    fields.push(`${key} = $${fields.length + 1}`);
    values.push(typeof value === 'string' ? value.trim() : value);
  });

  if (fields.length === 0) {
    throw new AppError('No menu fields provided for update', 400);
  }

  values.push(id);

  const result = await query<MenuItem>(
    `UPDATE menu_items
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, name, description, price, category, is_available, created_at, updated_at`,
    values,
  );

  if (!result.rows[0]) {
    throw new AppError('Menu item not found', 404);
  }

  return result.rows[0];
}
