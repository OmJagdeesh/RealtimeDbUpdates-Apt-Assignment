# Realtime DB Updates - Apt Assignment

Backend engineering assignment for building a realtime database update propagation system with Node.js, PostgreSQL, and WebSockets.

The final system will notify connected clients when the `orders` table changes, without client polling. This first commit sets up only the backend foundation and infrastructure.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- `pg`
- Socket.IO
- dotenv

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
- `src/sockets` will contain Socket.IO setup in a later commit.
- `src/utils` contains shared utilities such as logging.
- `sql` contains database schema and trigger setup.

The current realtime flow is:

```text
PostgreSQL orders table change
-> orders_notify_change trigger
-> pg_notify('orders_changes', payload)
-> Node.js LISTEN orders_changes
-> structured log entry
```

PostgreSQL `LISTEN/NOTIFY` was chosen over polling because the database can emit events only when data changes. This reduces unnecessary repeated reads, lowers database load, and gives the backend an event-driven path for future Socket.IO broadcasting.

Socket.IO event broadcasting and a realtime client will be implemented in later commits.

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
