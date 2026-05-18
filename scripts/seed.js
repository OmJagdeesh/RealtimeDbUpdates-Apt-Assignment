import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const { Pool } = pg;

const sampleOrders = [
  ['Ada Lovelace', 'Execution Engine', 'pending'],
  ['Grace Hopper', 'Realtime Console', 'shipped'],
  ['Katherine Johnson', 'Signal Board', 'delivered']
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

try {
  for (const [customerName, productName, status] of sampleOrders) {
    await pool.query(
      `INSERT INTO orders (customer_name, product_name, status)
       VALUES ($1, $2, $3)`,
      [customerName, productName, status]
    );
  }

  console.log(`Seeded ${sampleOrders.length} sample orders.`);
} catch (error) {
  console.error(`Failed to seed sample orders: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
