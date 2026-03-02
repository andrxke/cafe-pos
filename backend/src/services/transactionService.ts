// c:\Coding\OpenCafe\cafe-pos\backend\src\services\transactionService.ts
import { query } from '../db/db';

export async function listTransactions() {
  const result = await query<{
    id: number;
    order_id: number;
    total_amount: number;
    created_at: string;
    customer_name: string;
    items: unknown;
  }>(
    `SELECT t.id,
            t.order_id,
            t.total_amount,
            t.created_at,
            o.customer_name,
            COALESCE(
              json_agg(
                json_build_object(
                  'menu_item_id', oi.menu_item_id,
                  'menu_item_name', mi.name,
                  'quantity', oi.quantity,
                  'unit_price', oi.unit_price,
                  'subtotal', oi.subtotal
                )
              ) FILTER (WHERE oi.id IS NOT NULL),
              '[]'
            ) AS items
     FROM transactions t
     INNER JOIN orders o ON o.id = t.order_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
     GROUP BY t.id, o.customer_name
     ORDER BY t.created_at DESC`,
  );

  return result.rows;
}

