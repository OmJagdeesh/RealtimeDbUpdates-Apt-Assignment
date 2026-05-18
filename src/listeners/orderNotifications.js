import { pool } from '../db/postgres.js';
import { logger } from '../utils/logger.js';

const ORDERS_CHANNEL = 'orders_changes';

let listenerClient;

export const startOrderChangeListener = async () => {
  listenerClient = await pool.connect();

  listenerClient.on('notification', (message) => {
    let payload = message.payload;

    try {
      payload = JSON.parse(message.payload);
    } catch {
      logger.warn('Received non-JSON order notification payload', {
        channel: message.channel,
        payload: message.payload
      });
      return;
    }

    logger.info('Received order database notification', {
      channel: message.channel,
      payload
    });
  });

  listenerClient.on('error', (error) => {
    logger.error('PostgreSQL notification listener error', {
      error: error.message
    });
  });

  await listenerClient.query(`LISTEN ${ORDERS_CHANNEL}`);
  logger.info('Listening for order database notifications', {
    channel: ORDERS_CHANNEL
  });
};

export const stopOrderChangeListener = async () => {
  if (!listenerClient) {
    return;
  }

  await listenerClient.query(`UNLISTEN ${ORDERS_CHANNEL}`);
  listenerClient.release();
  listenerClient = undefined;

  logger.info('Stopped order database notification listener', {
    channel: ORDERS_CHANNEL
  });
};
