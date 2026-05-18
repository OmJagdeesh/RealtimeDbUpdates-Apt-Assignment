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
- `src/routes` contains HTTP routes.
- `src/services` will contain business logic.
- `src/listeners` will contain database change listeners in a later commit.
- `src/sockets` will contain Socket.IO setup in a later commit.
- `src/utils` contains shared utilities such as logging.
- `sql` contains database schema setup.

Realtime database propagation, Socket.IO event handling, PostgreSQL `LISTEN/NOTIFY`, CRUD APIs, and a realtime client will be implemented in later commits.
