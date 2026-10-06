import Database, { Database as SQLiteDatabase } from 'better-sqlite3';
import { join } from 'path';

const db: SQLiteDatabase = new Database(join(process.cwd(), 'ecommerce.db'));

const createTables = (): void => {
  db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    card_number TEXT NOT NULL,
    payment_type TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL UNIQUE,
    quantity INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    data TEXT NOT NULL,
    occurred_at TEXT NOT NULL
  );
`);
}

const seedData = (): void => {
  const checkInventory = db.prepare('SELECT COUNT(*) as count FROM inventory').get() as { count: number };
  if (checkInventory.count === 0) {
    const insertInventory = db.prepare('INSERT INTO inventory (product_name, quantity, updated_at) VALUES (?, ?, ?)');
    insertInventory.run('Notebook', 1000, new Date().toISOString());
    insertInventory.run('Mouse', 5000, new Date().toISOString());
    insertInventory.run('Teclado', 3000, new Date().toISOString());
    console.log('✓ Estoque inicial criado');
  }
}

export { db, createTables, seedData };