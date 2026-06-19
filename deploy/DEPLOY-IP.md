# Deploy Library app on port 5000 (alongside other apps)

Your droplet already runs:

| App | URL |
|-----|-----|
| GurukulamHub | `http://139.59.6.209:3000` |
| Valmiki Ashram | `http://139.59.6.209:4000` |
| **Library System** | **`http://139.59.6.209:5000`** |

Do **not** stop or change ports 3000 and 4000.

## Library URLs

| What | URL |
|------|-----|
| Open in browser | `http://139.59.6.209:5000` |
| Health check | `http://139.59.6.209:5000/api/health` |
| Login API | `http://139.59.6.209:5000/api/auth/login` |

---

## Step 1 — Push code to GitHub

Commit and push all Docker files from your PC.

---

## Step 2 — SSH into droplet

```bash
ssh root@139.59.6.209
```

---

## Step 3 — Install Docker (skip if already installed)

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin git
```

---

## Step 4 — Clone the project

```bash
mkdir -p /opt/library
cd /opt/library
git clone https://github.com/<your-user>/Library-Management-System.git .
```

---

## Step 5 — Create `.env` on the server

```bash
cp deploy/.env.ip.example .env
nano .env
```

Example (use **new** Aiven password + JWT secret):

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=15m
CORS_ORIGINS=http://139.59.6.209:5000
TRUST_PROXY=true

DB_PROFILE=online
DATABASE_URL=postgres://avnadmin:<PASSWORD>@pg-3c8fe800-rnoonegen-8cc2.e.aivencloud.com:28167/library_db?sslmode=require
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

SEED_ADMIN_PASSWORD=<temp-admin-password>
REACT_APP_API_URL=/api
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 6 — Open port 5000 in firewall

```bash
sudo ufw allow 5000
sudo ufw status
```

Ports 3000 and 4000 should already be allowed.

---

## Step 7 — Start Docker

```bash
cd /opt/library
docker compose -f docker-compose.ip.yml up -d --build
```

Wait 1–2 minutes for build. Then check:

```bash
docker compose -f docker-compose.ip.yml ps
curl http://127.0.0.1:5000/api/health
```

---

## Step 8 — Test in browser

1. Open **`http://139.59.6.209:5000`**
2. You should see the Library login page
3. Login with admin (created via `SEED_ADMIN_PASSWORD`)

If login fails:

```bash
docker compose -f docker-compose.ip.yml logs -f backend
```

---

## Step 9 — After first login

Remove `SEED_ADMIN_PASSWORD` from `.env`:

```bash
nano .env
docker compose -f docker-compose.ip.yml restart backend
```

---

## Update later

```bash
cd /opt/library
git pull origin main
docker compose -f docker-compose.ip.yml up -d --build
```

---

## Summary

```
139.59.6.209:3000  →  GurukulamHub      (keep as-is)
139.59.6.209:4000  →  Valmiki Ashram    (keep as-is)
139.59.6.209:5000  →  Library System    (new — UI + /api)
```
