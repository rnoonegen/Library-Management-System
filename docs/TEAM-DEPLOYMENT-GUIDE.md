# Library Management System — Deployment Guide (For Team)

Step-by-step guide for deploying the Library app on our **DigitalOcean droplet**, written for juniors. This matches how **Valmiki Ashram** is deployed (React + Node.js + Docker Compose).

---

## 1. Overview

### Tech stack

| Layer      | Technology                                       |
| ---------- | ------------------------------------------------ |
| Frontend   | React 18 (Create React App)                      |
| Backend    | Node.js + Express                                |
| Database   | **Aiven PostgreSQL** (cloud — not inside Docker) |
| Server     | Ubuntu 24.04 on DigitalOcean                     |
| Containers | Docker + Docker Compose                          |

### Architecture on our droplet (`139.59.6.209`)

```
Browser
   │
   ├── http://139.59.6.209:3000  →  GurukulamHub
   ├── http://139.59.6.209:4000  →  Valmiki Ashram (website)
   ├── http://139.59.6.209:5000  →  Valmiki Ashram (API)  ← do NOT use for Library
   │
   ├── http://139.59.6.209:5002  →  Library (React UI)
   └── http://139.59.6.209:5003  →  Library (Node API)
```

**Why port 5002 and 5003?** Port **5000** is already used by Valmiki’s API (`valmiki-server`). Library needs its own ports.

### Important files in the repo

| File                              | Purpose                                                                     |
| --------------------------------- | --------------------------------------------------------------------------- |
| `docker-compose.library.yml`      | Starts frontend + backend containers                                        |
| `.env.library.example`            | Template for server secrets (copy to `.env.library`)                        |
| `Backend/Dockerfile`              | Builds the API image                                                        |
| `Frontend/Dockerfile`             | Builds React app + Nginx                                                    |
| `Frontend/jsconfig.json`          | Path aliases (`import X from 'components/...'`) — required for Docker build |
| `.github/workflows/deploy-do.yml` | Optional: auto-deploy on push to `main`                                     |

### GitHub repository

```
https://github.com/rnoonegen/Library-Management-System.git
```

### Server folder

```
/var/www/library-management-system
```

---

## 2. Prerequisites

Before deploying, ensure you have:

- [ ] Access to the DigitalOcean droplet (`ssh root@139.59.6.209`)
- [ ] Aiven PostgreSQL connection URL (`DATABASE_URL`)
- [ ] Code pushed to GitHub `main` branch
- [ ] Docker installed on the droplet (`docker --version`, `docker compose version`)

---

## 3. Part A — On your PC (Windows)

### Step A1 — Push latest code to GitHub

```powershell
cd C:\Users\DELL\Desktop\Nagaraju\Library-Management-System
git add .
git commit -m "Describe your changes"
git push origin main
```

**Never commit** `.env`, `.env.library`, or files with real passwords.

### Step A2 — Generate JWT secret (one time)

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output. You will paste it into `.env.library` on the server as `JWT_SECRET`.

---

## 4. Part B — On the DigitalOcean server

### Step B1 — SSH into the server

```powershell
ssh root@139.59.6.209
```

### Step B2 — Clone the project (first time only)

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/rnoonegen/Library-Management-System.git library-management-system
cd /var/www/library-management-system
```

**If already cloned**, only pull updates:

```bash
cd /var/www/library-management-system
git pull origin main
```

### Step B3 — Create environment file

```bash
cp .env.library.example .env.library
nano .env.library
```

Fill in real values (example):

```env
CLIENT_URL=http://139.59.6.209:5002
REACT_APP_API_URL=http://139.59.6.209:5003/api

JWT_SECRET=paste-your-64-char-random-string
JWT_EXPIRES_IN=15m
TRUST_PROXY=false

DB_PROFILE=online
DATABASE_URL=postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.aivencloud.com:PORT/library_db?sslmode=require
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

SEED_ADMIN_PASSWORD=TempPasswordForFirstSetupOnly

# Required for HTTP (no SSL) — login cookies won't work without these
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

| Variable              | Meaning                                            |
| --------------------- | -------------------------------------------------- |
| `CLIENT_URL`          | Frontend URL — used for CORS                       |
| `REACT_APP_API_URL`   | API URL baked into React build                     |
| `JWT_SECRET`          | Secret for login tokens — must be long and random  |
| `DATABASE_URL`        | Aiven PostgreSQL connection string                 |
| `SEED_ADMIN_PASSWORD` | Only creates admin if missing — remove after setup |
| `COOKIE_SECURE=false` | Required because we use **HTTP** not HTTPS         |

Save in nano: `Ctrl+O` → Enter → `Ctrl+X`

### Step B4 — Open firewall ports

```bash
ufw allow 5002/tcp
ufw allow 5003/tcp
ufw status
```

### Step B5 — Build and start containers

```bash
cd /var/www/library-management-system
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
```

First build takes **5–15 minutes**.

Watch logs:

```bash
docker compose --env-file .env.library -f docker-compose.library.yml logs -f
```

Press `Ctrl+C` to stop watching (containers keep running).

### Step B6 — Verify deployment

```bash
docker compose --env-file .env.library -f docker-compose.library.yml ps
```

Expected: `library-client` and `library-server` both **Up** (server **healthy**).

```bash
curl http://127.0.0.1:5003/api/health
```

Expected response:

```json
{ "status": "ok", "dbMode": "online" }
```

### Step B7 — Open in browser

| What               | URL                                 |
| ------------------ | ----------------------------------- |
| Library login page | http://139.59.6.209:5002            |
| API health check   | http://139.59.6.209:5003/api/health |

---

## 5. Admin login

### Default username

```
admin
```

### Password

- If admin **does not exist** in DB: password from `SEED_ADMIN_PASSWORD` in `.env.library`
- If admin **already exists** in Aiven (from dev): `SEED_ADMIN_PASSWORD` is **ignored** — you must reset:

```bash
cd /var/www/library-management-system
docker compose --env-file .env.library -f docker-compose.library.yml exec server node src/db/resetAdminPassword.js YourNewPassword@123
```

Then login with `admin` / `YourNewPassword@123`.

### After first successful login

1. Change password inside the app
2. Remove `SEED_ADMIN_PASSWORD` from `.env.library`
3. Restart server:

```bash
docker compose --env-file .env.library -f docker-compose.library.yml restart server
```

---

## 6. Updating the app (redeploy)

### On PC

```powershell
git add .
git commit -m "Your change"
git push origin main
```

### On server

```bash
cd /var/www/library-management-system
git pull origin main
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
```

---

## 7. Common problems and fixes

### Problem 1 — Port 5000 shows Valmiki JSON, not Library

**Cause:** Port 5000 belongs to `valmiki-server`, not Library.

**Fix:** Use **5002** (UI) and **5003** (API) for Library.

---

### Problem 2 — Docker build fails: `npm ci` / `yaml` lock file error

**Cause:** `package-lock.json` out of sync in Docker environment.

**Fix:** `Frontend/Dockerfile` uses `npm install` instead of `npm ci`. Pull latest code from GitHub.

---

### Problem 3 — Docker build fails: `Can't resolve 'App'`

**Cause:** `jsconfig.json` was not copied into Docker image (path aliases missing).

**Fix:** `Frontend/Dockerfile` uses `COPY . .` so `jsconfig.json` is included. Pull latest code.

---

### Problem 4 — `ERR_CONNECTION_REFUSED` on port 5002

**Cause:** Containers not running or build failed.

**Fix:**

```bash
docker compose --env-file .env.library -f docker-compose.library.yml ps
docker compose --env-file .env.library -f docker-compose.library.yml logs --tail 50
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
```

---

### Problem 5 — Login says "Invalid username or password"

**Cause:** Admin already exists in database with a different password.

**Fix:** Reset password (see Section 5).

---

### Problem 6 — Login succeeds but stays on login page

**Cause:** Cookies set with `Secure: true` but site uses **HTTP** (not HTTPS). Browser rejects cookies.

**Fix:** Add to `.env.library`:

```env
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

Rebuild/restart server, clear browser cookies, try again in incognito window.

---

## 8. Useful commands (cheat sheet)

```bash
# SSH
ssh root@139.59.6.209

# Go to project
cd /var/www/library-management-system

# Start / rebuild
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build

# Stop
docker compose --env-file .env.library -f docker-compose.library.yml down

# Container status
docker compose --env-file .env.library -f docker-compose.library.yml ps

# Backend logs
docker compose --env-file .env.library -f docker-compose.library.yml logs server -f

# Frontend logs
docker compose --env-file .env.library -f docker-compose.library.yml logs client -f

# Reset admin password
docker compose --env-file .env.library -f docker-compose.library.yml exec server node src/db/resetAdminPassword.js NewPassword@123

# Health check
curl http://127.0.0.1:5003/api/health

# What is using a port?
ss -tlnp | grep 5002
docker ps
```

---

## 9. Comparison with Valmiki Ashram deployment

| Item               | Valmiki Ashram               | Library System                       |
| ------------------ | ---------------------------- | ------------------------------------ |
| Repo folder        | `/var/www/valmiki-ashram`    | `/var/www/library-management-system` |
| Compose file       | `docker-compose.valmiki.yml` | `docker-compose.library.yml`         |
| Env file           | `.env.valmiki`               | `.env.library`                       |
| Frontend port      | 4000                         | 5002                                 |
| API port           | 5000                         | 5003                                 |
| Database           | MongoDB in Docker            | Aiven PostgreSQL (external)          |
| Frontend → API env | `REACT_APP_SERVER_URL`       | `REACT_APP_API_URL`                  |
| CORS env           | `CLIENT_URL`                 | `CLIENT_URL`                         |

Same pattern: **two Docker containers** (client + server), env file, `docker compose up -d --build`.

---

## 10. Security checklist

- [ ] Never commit `.env.library` to GitHub
- [ ] Use a strong `JWT_SECRET` (64+ random characters)
- [ ] Remove `SEED_ADMIN_PASSWORD` after admin is set up
- [ ] Rotate Aiven password if it was ever shared
- [ ] Change default admin password after first login
- [ ] Later: add domain + HTTPS (Let's Encrypt) and set `COOKIE_SECURE=true`

---

## 11. Optional — GitHub Actions auto-deploy

Workflow file: `.github/workflows/deploy-do.yml`

Add these **GitHub Secrets** (repo → Settings → Secrets):

| Secret         | Example         |
| -------------- | --------------- |
| `DO_HOST`      | `139.59.6.209`  |
| `DO_USER`      | `root`          |
| `DO_SSH_KEY`   | Private SSH key |
| `JWT_SECRET`   | Your JWT secret |
| `DATABASE_URL` | Full Aiven URL  |

After setup, every push to `main` runs tests and deploys automatically.

---

## 12. Quick reference — full first-time deploy

```
PC:     git push origin main
PC:     generate JWT_SECRET

Server: ssh root@139.59.6.209
Server: git clone → /var/www/library-management-system
Server: cp .env.library.example .env.library → edit values
Server: ufw allow 5002 && ufw allow 5003
Server: docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
Server: reset admin password if needed
Browser: http://139.59.6.209:5002 → login as admin
```

---

**Questions?** Check logs first, then ask the team lead with the output of `docker compose ... ps` and `logs server --tail 50`.
