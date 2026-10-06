import { db } from '../database/database.js';
import { Payment } from '../models/payment.js';

export class PaymentRepository {
  create(payment: Payment): number {
    const insert = db.prepare(`
      INSERT INTO payments (order_id, card_number, payment_type, amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      payment.order_id,
      payment.card_number,
      payment.payment_type,
      payment.amount,
      payment.status,
      payment.created_at
    );

    return result.lastInsertRowid as number;
  }

  findByOrderId(orderId: number): Payment | undefined {
    const query = db.prepare('SELECT * FROM payments WHERE order_id = ?');
    return query.get(orderId) as Payment | undefined;
  }
}