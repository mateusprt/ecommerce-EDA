import { db } from '../database/database.js';
import { Order } from '../models/order.js';

export class OrderRepository {
  create(order: Order): number {
    const insert = db.prepare(`
      INSERT INTO orders (customer_name, total_amount, status, created_at)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(
      order.customer_name,
      order.total_amount,
      order.status,
      order.created_at
    );

    return result.lastInsertRowid as number;
  }

  updateStatus(orderId: number, status: string): void {
    const update = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    update.run(status, orderId);
  }

  findById(orderId: number): Order | undefined {
    const query = db.prepare('SELECT * FROM orders WHERE id = ?');
    return query.get(orderId) as Order | undefined;
  }
}