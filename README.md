# Library Management System

Web application for managing books, users, borrow/return transactions, hold queues, extensions, fines, and notifications.

**Stack:** React 18 (frontend) · Node.js / Express (backend) · PostgreSQL (database)

## Project Structure

```
Library-Management-System/
├── Backend/     # Node.js Express API
└── Frontend/    # React SPA
```

## Setup

Install dependencies in each folder:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

Copy environment files:

```bash
copy Backend\.env.example Backend\.env
copy Frontend\.env.example Frontend\.env
```

Edit `Backend/.env` with your PostgreSQL connection and a strong `JWT_SECRET`.

## Run (development)

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd Backend
npm run dev
```
API: http://localhost:5000

**Terminal 2 — Frontend**
```bash
cd Frontend
npm start
```
UI: http://localhost:3000 (proxies `/api` to the backend)

## Database

The backend uses **PostgreSQL** with automatic schema migration on startup (`Backend/src/db/migrate.js`).

| `DB_PROFILE` | Use case |
|--------------|----------|
| `local` | PostgreSQL on your machine |
| `online` | Shared cloud database (team development) |

Set either `DATABASE_URL` or individual `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `Backend/.env`.

On first run, set `SEED_ADMIN_PASSWORD` to create the default `admin` user (only if missing). **Remove or unset this after initial setup** — it is not used to reset passwords on restart.

## Production checklist

- Set `NODE_ENV=production`
- Use a strong random `JWT_SECRET` (32+ characters)
- Set `CORS_ORIGINS` to your frontend URL(s)
- Set `TRUST_PROXY=true` when behind nginx / a load balancer
- Auth uses **httpOnly cookies** (access + refresh tokens) — frontend must call API with credentials
- Use `DB_SSL=true` and prefer `DB_SSL_REJECT_UNAUTHORIZED=true` when your provider supports it
- Build frontend with `REACT_APP_API_URL` pointing to your API
- Never commit `.env` files

## Features

- **Dashboard** — library stats overview
- **Books** — catalog management with search and pagination
- **Users** — admin management of teachers and students
- **Borrow / Return** — loans, fines, and payments
- **Hold queue** — request → ready → collect workflow
- **Extensions** — due-date extension requests
- **Notifications** — in-app alerts for users and admins

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (rate-limited) |
| GET | `/api/auth/me` | Current user profile |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/books` | List / create books |
| PUT/DELETE | `/api/books/:id` | Update / delete book |
| GET/POST | `/api/admin/users` | List / create users |
| PUT/DELETE | `/api/admin/users/:id` | Update / delete user |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions/borrow` | Borrow a book |
| POST | `/api/transactions/:id/return` | Return a book |
| POST | `/api/transactions/:id/pay` | Record fine payment |

See `Backend/src/routes/index.js` for the full route list.
