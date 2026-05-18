const ordersTableBody = document.querySelector('#orders-table-body');
const ordersCount = document.querySelector('#orders-count');
const eventFeed = document.querySelector('#event-feed');
const refreshButton = document.querySelector('#refresh-orders');
const connectionStatus = document.querySelector('#connection-status');
const connectionDot = document.querySelector('#connection-dot');

let orders = [];

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(value));
};

const escapeHtml = (value) => {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

const setConnectionState = (state, label) => {
  connectionStatus.textContent = label;
  connectionDot.className = `connection-dot connection-dot--${state}`;
};

const renderOrders = () => {
  ordersCount.textContent = `${orders.length} active ${orders.length === 1 ? 'order' : 'orders'}`;

  if (orders.length === 0) {
    ordersTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No active orders yet.</td></tr>';
    return;
  }

  ordersTableBody.innerHTML = orders
    .map((order) => {
      return `
        <tr data-order-id="${order.id}">
          <td>#${order.id}</td>
          <td>${escapeHtml(order.customer_name)}</td>
          <td>${escapeHtml(order.product_name)}</td>
          <td><span class="status-badge status-badge--${order.status}">${order.status}</span></td>
          <td>${formatDate(order.updated_at)}</td>
        </tr>
      `;
    })
    .join('');
};

const addEventFeedItem = (payload) => {
  const order = payload.order;
  const subject = order?.id ? `order #${escapeHtml(order.id)}` : 'system event';
  const detail = order
    ? `${escapeHtml(order.customer_name)} - ${escapeHtml(order.product_name)}`
    : escapeHtml(payload.message || 'Realtime connection event');

  const item = document.createElement('li');
  item.className = 'event-item';
  item.innerHTML = `
    <strong><span class="event-operation">${escapeHtml(payload.operation)}</span> ${subject}</strong>
    <span>${detail}</span>
    <span>${formatDate(payload.timestamp)}</span>
  `;

  eventFeed.prepend(item);

  while (eventFeed.children.length > 20) {
    eventFeed.removeChild(eventFeed.lastElementChild);
  }
};

const applyOrderChange = (payload) => {
  const changedOrder = payload.order;

  if (payload.operation === 'DELETE') {
    orders = orders.filter((order) => order.id !== changedOrder.id);
  } else {
    const existingIndex = orders.findIndex((order) => order.id === changedOrder.id);

    if (existingIndex >= 0) {
      orders[existingIndex] = changedOrder;
    } else {
      orders = [...orders, changedOrder];
    }
  }

  orders.sort((a, b) => a.id - b.id);
  renderOrders();
  addEventFeedItem(payload);
};

const loadOrders = async () => {
  const response = await fetch('/api/orders');

  if (!response.ok) {
    throw new Error('Failed to load orders');
  }

  const result = await response.json();
  orders = result.data;
  renderOrders();
};

refreshButton.addEventListener('click', async () => {
  refreshButton.disabled = true;

  try {
    await loadOrders();
  } finally {
    refreshButton.disabled = false;
  }
});

const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000
});

socket.on('connect', () => {
  setConnectionState('online', 'Connected');
});

socket.on('connection:ready', (payload) => {
  addEventFeedItem({
    operation: 'CONNECTED',
    message: `WebSocket session ${payload.socketId.slice(0, 6)} is ready`,
    timestamp: payload.timestamp
  });
});

socket.on('disconnect', () => {
  setConnectionState('offline', 'Disconnected');
});

socket.io.on('reconnect_attempt', () => {
  setConnectionState('connecting', 'Reconnecting');
});

socket.io.on('reconnect', () => {
  setConnectionState('online', 'Reconnected');
  loadOrders().catch(() => {
    setConnectionState('offline', 'Sync failed');
  });
});

socket.on('connect_error', () => {
  setConnectionState('connecting', 'Connecting');
});

socket.on('orders:change', applyOrderChange);

loadOrders().catch(() => {
  ordersTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">Unable to load orders.</td></tr>';
});
