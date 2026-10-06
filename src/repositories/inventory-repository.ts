import { db } from '../database/database.js';
import { Inventory } from '../models/inventory.js';

export class InventoryRepository {
  findByProductName(productName: string): Inventory | undefined {
    const query = db.prepare('SELECT * FROM inventory WHERE product_name = ?');
    return query.get(productName) as Inventory | undefined;
  }

  updateQuantity(productName: string, quantity: number): void {
    const update = db.prepare(`
      UPDATE inventory
      SET quantity = ?, updated_at = ?
      WHERE product_name = ?
    `);
    update.run(quantity, new Date().toISOString(), productName);
  }

  decreaseQuantity(productName: string, amount: number): boolean {
    const product = this.findByProductName(productName);

    if (!product || product.quantity < amount) {
      return false;
    }

    this.updateQuantity(productName, product.quantity - amount);
    return true;
  }
}