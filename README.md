# Library Management System

Web application for managing books, members, and borrow/return transactions.

**Stack:** React (frontend) · Node.js/Express (backend) · MySQL (database)

## Project Structure

```
Library-Management-System/
├── backend/     # Node.js Express API
└── frontend/    # React UI
```

## Setup

Install dependencies in each folder:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
API: http://localhost:5000

**Terminal 2 — Frontend**
```bash
cd frontend
npm start
```
UI: http://localhost:3000

## Database Options (Local + Online)

The backend supports **three modes**. Switch using `DB_PROFILE` in `backend/.env`:

| Mode | `DB_PROFILE` | Best for |
|------|--------------|----------|
| In-memory | `memory` | Quick testing without MySQL |
| Local MySQL | `local` | Offline work on your own PC |
| Online MySQL | `online` | **Team development** (shared data) |

### Recommended for 2-person team

- **Both developers:** use `DB_PROFILE=online` with the **same shared cloud database**
- **Optional offline:** one developer can switch to `DB_PROFILE=local` when working without internet

### Option A — Online MySQL (team shared)

1. Create a MySQL database on [Railway](https://railway.app) or [Aiven](https://aiven.io)
2. Copy the team config:

```bash
copy backend\.env.online.example backend\.env
```

3. Paste your cloud connection details into `backend/.env`
4. Create tables:

```bash
cd backend
npm run db:init
```

5. Start the backend — sidebar shows **Online MySQL**

### Option B — Local MySQL (your PC only)

1. Install [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. Copy local config:

```bash
copy backend\.env.local.example backend\.env
```

3. Edit `backend/.env` with your MySQL password
4. Create database and tables:

```bash
cd backend
npm run db:init
```

5. Start the backend — sidebar shows **Local MySQL**

### Switching between local and online

Just change `DB_PROFILE` in `backend/.env` and restart the backend:

```
DB_PROFILE=local    # your computer
DB_PROFILE=online   # shared cloud database
DB_PROFILE=memory   # no MySQL
```

**Never commit `.env` to git** — each developer keeps their own copy.

## Features

- **Dashboard** — library stats overview
- **Books** — add, edit, delete books
- **Members** — manage library members
- **Borrow / Return** — loan books and process returns

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/books` | List / create books |
| PUT/DELETE | `/api/books/:id` | Update / delete book |
| GET/POST | `/api/members` | List / create members |
| PUT/DELETE | `/api/members/:id` | Update / delete member |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions/borrow` | Borrow a book |
| POST | `/api/transactions/:id/return` | Return a book |
