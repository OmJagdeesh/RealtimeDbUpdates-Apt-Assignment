# Realtime DB Updates - Apt Assignment

Backend engineering assignment for building a realtime database update propagation system with Node.js, PostgreSQL, and WebSockets.

The system notifies connected clients when the `orders` table changes, without client polling.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- `pg`
- Socket.IO
- dotenv
- Plain HTML/CSS/JS dashboard

## Setup

Install dependencies:

```powershell
npm.cmd install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Update `DATABASE_URL` in `.env` if your local PostgreSQL credentials differ from the example.

Apply the database schema:

```powershell
npm.cmd run db:schema
```

Apply database triggers for realtime notifications:

```powershell
npm.cmd run db:triggers
```

Start the development server:

```powershell
npm.cmd run dev
```

Check service health:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

## Architecture

This service is organized around small, focused modules:

- `src/config` loads and validates environment configuration.
- `src/db` owns PostgreSQL connection setup.
- `src/controllers` translates HTTP requests into service calls.
- `src/routes` contains HTTP routes.
- `src/services` contains order business logic and persistence workflows.
- `src/listeners` contains the PostgreSQL notification listener.
- `src/sockets` contains Socket.IO setup and broadcast helpers.
- `src/utils` contains shared utilities such as logging.
- `public` contains the realtime dashboard.
- `sql` contains database schema and trigger setup.

The current realtime flow is:

```text
PostgreSQL orders table change
-> orders_notify_change trigger
-> pg_notify('orders_changes', payload)
-> Node.js LISTEN orders_changes
-> Socket.IO orders:change broadcast
-> connected dashboard clients update instantly
```

PostgreSQL `LISTEN/NOTIFY` was chosen over polling because the database can emit events only when data changes. This reduces unnecessary repeated reads, lowers database load, and gives the backend an event-driven path for Socket.IO broadcasting.

WebSockets are a better fit than polling here because each connected client holds one persistent connection and receives updates only when state changes. That avoids repeated client requests, stale polling intervals, and avoidable pressure on PostgreSQL during quiet periods.

The dashboard uses Socket.IO reconnect handling and refreshes the orders list after reconnecting so clients can resync if they missed an event while offline.

## API

Orders endpoints:

- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`

Allowed order statuses:

- `pending`
- `shipped`
- `delivered`

## WebSocket Events

The backend broadcasts order changes on the `orders:change` event.

Example payload:

```json
{
  "operation": "INSERT",
  "order": {
    "id": 1,
    "customer_name": "Ada Lovelace",
    "product_name": "Execution Engine",
    "status": "pending",
    "updated_at": "2026-05-18T22:46:32.5491+05:30"
  },
  "timestamp": "2026-05-18T22:46:32.5491+05:30"
}
```

The server logs websocket client connections, disconnections, connection errors, and broadcast events.

## Scalability Notes

This implementation keeps the update path event-driven for the single-node assignment scope. For multiple Node.js instances, use a Socket.IO adapter such as Redis so broadcasts reach clients connected to any instance. PostgreSQL `LISTEN/NOTIFY` is efficient for lightweight event fanout, but high-throughput systems should consider an external message broker and keep notification payloads compact.

## Screenshots

Dashboard screenshots can be added here after visual QA.
