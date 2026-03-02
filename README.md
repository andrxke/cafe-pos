<!-- c:\Coding\OpenCafe\cafe-pos\README.md -->

# Cafe POS

A simple cafe POS starter built with Node.js, Express.js, TypeScript, PostgreSQL, `pg`, and Angular 17 standalone components.

## Project Structure

```text
cafe-pos/
  backend/
  frontend/
  .env.example
  vercel.json
```

## Features

- Customer ordering screen at `/order`
- Barista queue management at `/barista`
- Queue display screen at `/queue`
- Admin dashboard at `/admin`
- Raw SQL service layer with clear controller and route separation
- SQL migrations included in `backend/migrations`
- API responses shaped as `{ success, data, error? }`

## Environment Variables

Copy `.env.example` to `.env` at the repository root.

- `PORT`: backend server port
- `NODE_ENV`: runtime mode
- `DATABASE_URL`: full PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: used if `DATABASE_URL` is not set
- `CORS_ORIGIN`: allowed frontend origins, comma-separated
- `API_BASE_URL`: frontend reference for the backend API URL

## Local Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create the PostgreSQL database:

```sql
CREATE DATABASE cafe_pos;
```

3. Copy the example env file and update credentials:

```bash
cp .env.example .env
```

4. Run the SQL migration:

```bash
npm run migrate
```

5. Start the backend:

```bash
npm run dev:backend
```

6. Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

Default URLs:

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:4000`

## API Summary

### Menu

- `GET /api/menu`
- `POST /api/menu`
- `PATCH /api/menu/:id`

### Orders

- `GET /api/orders`
- `GET /api/orders/queue`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/comments`

### Inventory

- `GET /api/inventory`
- `PATCH /api/inventory/:id`

### Transactions

- `GET /api/transactions`

### Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/low-stock`

## Notes

- Transactions are created when an order is submitted to keep reporting simple.
- Inventory is reduced by ordered quantity when an order is created.
- New menu items get a matching inventory row automatically.
- Route wiring is isolated so websocket support can be added later without rewriting the service layer.
- For Vercel deployment, set the project root to this repository and use the included `vercel.json`.
