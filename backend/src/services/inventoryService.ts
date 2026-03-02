// c:\Coding\OpenCafe\cafe-pos\backend\src\services\inventoryService.ts
import { query } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import type { InventoryItem } from '../types/entities';

export async function listInventory() {
  const result = await query<InventoryItem>(
    `SELECT i.id,
            i.menu_item_id,
            i.quantity_in_stock,
            i.unit,
            i.low_stock_threshold,
            i.updated_at,
            mi.name AS item_name,
            (i.quantity_in_stock <= i.low_stock_threshold) AS is_low_stock
     FROM inventory i
     INNER JOIN menu_items mi ON mi.id = i.menu_item_id
     ORDER BY mi.name`,
  );

  return result.rows;
}

export async function updateInventory(id: number, quantityInStock: number) {
  const result = await query<InventoryItem>(
    `UPDATE inventory
     SET quantity_in_stock = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, menu_item_id, quantity_in_stock, unit, low_stock_threshold, updated_at`,
    [quantityInStock, id],
  );

  if (!result.rows[0]) {
    throw new AppError('Inventory item not found', 404);
  }

  return result.rows[0];
}

