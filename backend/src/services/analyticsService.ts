// c:\Coding\OpenCafe\cafe-pos\backend\src\services\analyticsService.ts
import { query } from '../db/db';
import type { AnalyticsSummary, InventoryItem } from '../types/entities';

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const [revenueResult, ordersResult, topItemsResult] = await Promise.all([
    query<{ total_revenue: string }>(
      `SELECT COALESCE(SUM(total_amount), 0)::text AS total_revenue
       FROM transactions
       WHERE created_at::date = CURRENT_DATE`,
    ),
    query<{ orders_today: string }>(
      `SELECT COUNT(*)::text AS orders_today
       FROM orders
       WHERE created_at::date = CURRENT_DATE`,
    ),
    query<{ menu_item_id: number; name: string; quantity_sold: string }>(
      `SELECT oi.menu_item_id, mi.name, SUM(oi.quantity)::text AS quantity_sold
       FROM order_items oi
       INNER JOIN menu_items mi ON mi.id = oi.menu_item_id
       INNER JOIN orders o ON o.id = oi.order_id
       WHERE o.created_at::date = CURRENT_DATE
       GROUP BY oi.menu_item_id, mi.name
       ORDER BY SUM(oi.quantity) DESC, mi.name ASC
       LIMIT 5`,
    ),
  ]);

  return {
    totalRevenue: Number(revenueResult.rows[0]?.total_revenue ?? 0),
    ordersToday: Number(ordersResult.rows[0]?.orders_today ?? 0),
    topSellingItems: topItemsResult.rows.map((row) => ({
      menu_item_id: row.menu_item_id,
      name: row.name,
      quantity_sold: Number(row.quantity_sold),
    })),
  };
}

export async function listLowStockItems() {
  const result = await query<InventoryItem>(
    `SELECT i.id,
            i.menu_item_id,
            i.quantity_in_stock,
            i.unit,
            i.low_stock_threshold,
            i.updated_at,
            mi.name AS item_name,
            true AS is_low_stock
     FROM inventory i
     INNER JOIN menu_items mi ON mi.id = i.menu_item_id
     WHERE i.quantity_in_stock <= i.low_stock_threshold
     ORDER BY i.quantity_in_stock ASC, mi.name ASC`,
  );

  return result.rows;
}

