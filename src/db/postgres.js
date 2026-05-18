import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl
});

export const verifyDatabaseConnection = async () => {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT NOW() AS connected_at');
    logger.info('PostgreSQL connection verified', {
      connectedAt: result.rows[0].connected_at
    });
  } finally {
    client.release();
  }
};

export const query = async (text, params) => {
  return pool.query(text, params);
};

export const closePool = async () => {
  await pool.end();
  logger.info('PostgreSQL connection pool closed');
};
