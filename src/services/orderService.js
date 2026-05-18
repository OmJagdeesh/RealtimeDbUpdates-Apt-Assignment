import { query } from '../db/postgres.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const VALID_STATUSES = new Set(['pending', 'shipped', 'delivered']);
const ORDER_FIELDS = ['customer_name', 'product_name', 'status'];

const parseOrderId = (id) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new ValidationError('Order id must be a positive integer');
  }

  return parsedId;
};

const validateOrderPayload = (payload) => {
  const details = {};

  for (const field of ORDER_FIELDS) {
    if (payload[field] === undefined) {
      details[field] = 'This field is required';
    }
  }

  if (
    payload.customer_name !== undefined &&
    (typeof payload.customer_name !== 'string' || payload.customer_name.trim() === '')
  ) {
    details.customer_name = 'Customer name must be a non-empty string';
  }

  if (
    payload.product_name !== undefined &&
    (typeof payload.product_name !== 'string' || payload.product_name.trim() === '')
  ) {
    details.product_name = 'Product name must be a non-empty string';
  }

  if (payload.status !== undefined && !VALID_STATUSES.has(payload.status)) {
    details.status = 'Status must be one of: pending, shipped, delivered';
  }

  if (Object.keys(details).length > 0) {
    throw new ValidationError('Invalid order payload', details);
  }

  return {
    customer_name: payload.customer_name.trim(),
    product_name: payload.product_name.trim(),
    status: payload.status
  };
};

export const getOrders = async () => {
  const result = await query(
    `SELECT id, customer_name, product_name, status, updated_at
     FROM orders
     ORDER BY id ASC`
  );

  return result.rows;
};

export const createOrder = async (payload) => {
  const order = validateOrderPayload(payload);

  const result = await query(
    `INSERT INTO orders (customer_name, product_name, status)
     VALUES ($1, $2, $3)
     RETURNING id, customer_name, product_name, status, updated_at`,
    [order.customer_name, order.product_name, order.status]
  );

  return result.rows[0];
};

export const updateOrder = async (id, payload) => {
  const orderId = parseOrderId(id);
  const order = validateOrderPayload(payload);

  const result = await query(
    `UPDATE orders
     SET customer_name = $1,
         product_name = $2,
         status = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, customer_name, product_name, status, updated_at`,
    [order.customer_name, order.product_name, order.status, orderId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(`Order ${orderId} not found`);
  }

  return result.rows[0];
};

export const deleteOrder = async (id) => {
  const orderId = parseOrderId(id);

  const result = await query(
    `DELETE FROM orders
     WHERE id = $1
     RETURNING id, customer_name, product_name, status, updated_at`,
    [orderId]
  );

  if (result.rowCount === 0) {
    throw new NotFoundError(`Order ${orderId} not found`);
  }

  return result.rows[0];
};
