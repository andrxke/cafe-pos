// c:\Coding\OpenCafe\cafe-pos\backend\src\services\orderService.ts
import type { PoolClient } from 'pg';
import { pool, query } from '../db/db';
import { AppError } from '../middleware/errorHandler';
import type {
  AddOrderCommentInput,
  CreateOrderInput,
  Order,
  OrderComment,
  OrderItem,
  OrderStatus,
} from '../types/entities';

async function attachOrderRelations(orders: Order[]) {
  if (orders.length === 0) {
    return orders;
  }

  const ids = orders.map((order) => order.id);

  const itemsResult = await query<OrderItem & { name: string }>(
    `SELECT oi.id, oi.order_id, oi.menu_item_id, oi.quantity, oi.unit_price, oi.subtotal, mi.name
     FROM order_items oi
     INNER JOIN menu_items mi ON mi.id = oi.menu_item_id
     WHERE oi.order_id = ANY($1::int[])
     ORDER BY oi.id`,
    [ids],
  );

  const commentsResult = await query<OrderComment>(
    `SELECT id, order_id, comment, created_at
     FROM order_comments
     WHERE order_id = ANY($1::int[])
     ORDER BY created_at DESC`,
    [ids],
  );

  const itemsByOrder = new Map<number, OrderItem[]>();
  for (const row of itemsResult.rows) {
    const current = itemsByOrder.get(row.order_id) ?? [];
    current.push({ ...row, menu_item_name: row.name });
    itemsByOrder.set(row.order_id, current);
  }

  const commentsByOrder = new Map<number, OrderComment[]>();
  for (const row of commentsResult.rows) {
    const current = commentsByOrder.get(row.order_id) ?? [];
    current.push(row);
    commentsByOrder.set(row.order_id, current);
  }

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(order.id) ?? [],
    comments: commentsByOrder.get(order.id) ?? [],
  }));
}

async function getMenuItemForOrder(client: PoolClient, menuItemId: number) {
  const result = await client.query<{ id: number; name: string; price: number; is_available: boolean }>(
    `SELECT id, name, price, is_available
     FROM menu_items
     WHERE id = $1`,
    [menuItemId],
  );

  const menuItem = result.rows[0];
  if (!menuItem) {
    throw new AppError(`Menu item ${menuItemId} not found`, 404);
  }

  if (!menuItem.is_available) {
    throw new AppError(`${menuItem.name} is not currently available`, 400);
  }

  return menuItem;
}

export async function listOrders() {
  const result = await query<Order>(
    `SELECT id, customer_name, status, total_amount, created_at, updated_at
     FROM orders
     ORDER BY created_at DESC`,
  );

  return attachOrderRelations(result.rows);
}

export async function getOrderQueue() {
  const result = await query<Order>(
    `SELECT id,
            customer_name,
            status,
            total_amount,
            created_at,
            updated_at,
            FLOOR(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60)::int AS elapsed_minutes
     FROM orders
     WHERE status IN ('pending', 'in_progress')
     ORDER BY created_at ASC`,
  );

  return attachOrderRelations(result.rows);
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.customer_name.trim()) {
    throw new AppError('Customer name is required', 400);
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new AppError('At least one order item is required', 400);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const normalizedItems: Array<{ menuItemId: number; quantity: number; unitPrice: number; subtotal: number }> =
      [];

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new AppError('Order item quantity must be greater than zero', 400);
      }

      const menuItem = await getMenuItemForOrder(client, item.menu_item_id);
      const subtotal = Number(menuItem.price) * item.quantity;
      totalAmount += subtotal;

      normalizedItems.push({
        menuItemId: menuItem.id,
        quantity: item.quantity,
        unitPrice: Number(menuItem.price),
        subtotal,
      });
    }

    const orderResult = await client.query<Order>(
      `INSERT INTO orders (customer_name, status, total_amount)
       VALUES ($1, 'pending', $2)
       RETURNING id, customer_name, status, total_amount, created_at, updated_at`,
      [input.customer_name.trim(), totalAmount],
    );

    const order = orderResult.rows[0];

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.menuItemId, item.quantity, item.unitPrice, item.subtotal],
      );

      await client.query(
        `UPDATE inventory
         SET quantity_in_stock = GREATEST(quantity_in_stock - $1, 0),
             updated_at = NOW()
         WHERE menu_item_id = $2`,
        [item.quantity, item.menuItemId],
      );
    }

    await client.query(
      `INSERT INTO transactions (order_id, total_amount)
       VALUES ($1, $2)`,
      [order.id, totalAmount],
    );

    await client.query('COMMIT');
    const [hydratedOrder] = await attachOrderRelations([order]);
    return hydratedOrder;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  if (!['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const result = await query<Order>(
    `UPDATE orders
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, customer_name, status, total_amount, created_at, updated_at`,
    [status, id],
  );

  if (!result.rows[0]) {
    throw new AppError('Order not found', 404);
  }

  const [order] = await attachOrderRelations([result.rows[0]]);
  return order;
}

export async function addOrderComment(id: number, input: AddOrderCommentInput) {
  if (!input.comment.trim()) {
    throw new AppError('Comment is required', 400);
  }

  const orderCheck = await query<{ id: number }>('SELECT id FROM orders WHERE id = $1', [id]);
  if (!orderCheck.rows[0]) {
    throw new AppError('Order not found', 404);
  }

  const result = await query<OrderComment>(
    `INSERT INTO order_comments (order_id, comment)
     VALUES ($1, $2)
     RETURNING id, order_id, comment, created_at`,
    [id, input.comment.trim()],
  );

  return result.rows[0];
}
