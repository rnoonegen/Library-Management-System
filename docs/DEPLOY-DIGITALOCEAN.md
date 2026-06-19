# Deploy Library Management System on DigitalOcean (Docker Compose)

Same deployment style as **Valmiki Ashram** — separate React client + Node API ports.

| App | Frontend | API |
|-----|----------|-----|
| GurukulamHub | `:3000` | (internal) |
| Valmiki Ashram | `:4000` | `:5000` |
| **Library** | **`:5002`** | **`:5003`** |

---

## 1) Clone on droplet

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/rnoonegen/Library-Management-System.git library-management-system
cd /var/www/library-management-system
```

---

## 2) Prepare env file

```bash
cp .env.library.example .env.library
nano .env.library
```

Set at minimum:

```env
CLIENT_URL=http://139.59.6.209:5002
REACT_APP_API_URL=http://139.59.6.209:5003/api
JWT_SECRET=your-long-random-secret
DATABASE_URL=postgres://avnadmin:PASSWORD@HOST:PORT/library_db?sslmode=require
SEED_ADMIN_PASSWORD=YourAdmin@123
```

Generate JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 3) Open firewall ports

```bash
ufw allow 5002/tcp
ufw allow 5003/tcp
ufw status
```

---

## 4) Start with Docker Compose

```bash
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
docker compose --env-file .env.library -f docker-compose.library.yml ps
```

Logs:

```bash
docker compose --env-file .env.library -f docker-compose.library.yml logs -f
```

---

## 5) Verify

```bash
curl http://127.0.0.1:5003/api/health
```

Browser:

- **UI:** http://139.59.6.209:5002
- **API:** http://139.59.6.209:5003/api/health

Login: `admin` / password from `SEED_ADMIN_PASSWORD`

---

## 6) After first login

Remove `SEED_ADMIN_PASSWORD` from `.env.library`, then:

```bash
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
```

(`--build` rebuilds client if API URL changed; server restart is enough if only env changed.)

---

## Update / redeploy

```bash
cd /var/www/library-management-system
git pull origin main
docker compose --env-file .env.library -f docker-compose.library.yml up -d --build
```

---

## Comparison with Valmiki Ashram

| | Valmiki | Library |
|---|---------|---------|
| Compose file | `docker-compose.valmiki.yml` | `docker-compose.library.yml` |
| Env file | `.env.valmiki` | `.env.library` |
| App dir | `/var/www/valmiki-ashram` | `/var/www/library-management-system` |
| Client port | 4000 | 5002 |
| Server port | 5000 | 5003 |
| Database | MongoDB in Docker | Aiven PostgreSQL (external) |
| Frontend env | `REACT_APP_SERVER_URL` | `REACT_APP_API_URL` |
| CORS env | `CLIENT_URL` | `CLIENT_URL` → `CORS_ORIGINS` |

---

## GitHub Actions

Workflow: `.github/workflows/deploy-do.yml`  
Secrets: `DO_HOST`, `DO_USER`, `DO_SSH_KEY`, `JWT_SECRET`, `DATABASE_URL`
