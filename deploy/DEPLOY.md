# First Deploy Checklist — DigitalOcean

Complete these steps on your droplet after the deployment files are in the repo.

## 1. Aiven PostgreSQL

1. Create an Aiven PostgreSQL service (region near your droplet).
2. Create database `library_db` (or use default and set `DB_NAME`).
3. Copy the **Service URI** into server `.env` as `DATABASE_URL`.
4. Set `DB_SSL=true`. Use `DB_SSL_REJECT_UNAUTHORIZED=false` unless you mount Aiven CA cert.

## 2. Domain DNS

| Type | Name | Value        |
| ---- | ---- | ------------ |
| A    | `@`  | `<DROPLET_IP>` |
| A    | `www`| `<DROPLET_IP>` |

Verify: `ping yourdomain.com` returns your droplet IP.

## 3. Server bootstrap

```bash
ssh root@<DROPLET_IP>

# Optional: pass domain and repo URL
DOMAIN=yourdomain.com REPO_URL=https://github.com/<user>/Library-Management-System.git \
  bash deploy/bootstrap-server.sh
```

Or follow manual steps in the main deployment plan.

## 4. Production `.env`

```bash
su - deploy
cd /opt/library
cp deploy/.env.production.example .env
nano .env
```

Generate JWT secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 5. Nginx (if not done by bootstrap)

```bash
sudo sed "s/YOUR_DOMAIN/yourdomain.com/g" /opt/library/deploy/nginx/library.conf \
  | sudo tee /etc/nginx/sites-available/library
sudo ln -sf /etc/nginx/sites-available/library /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

## 6. Start containers

```bash
cd /opt/library
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1:5000/api/health
```

Verify in browser: `http://yourdomain.com` — UI loads and admin login works.

## 7. Let's Encrypt SSL

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot renew --dry-run
```

Ensure `CORS_ORIGINS` uses `https://` URLs, then restart backend:

```bash
docker compose -f docker-compose.prod.yml restart backend
```

## 8. GitHub Actions secrets

In GitHub → Settings → Secrets and variables → Actions:

| Secret             | Value                    |
| ------------------ | ------------------------ |
| `DROPLET_HOST`     | Droplet IP or domain     |
| `DROPLET_USER`     | `deploy`                 |
| `DROPLET_SSH_KEY`  | Private SSH key (PEM)    |
| `DROPLET_APP_PATH` | `/opt/library`           |

Push to `main` to trigger automated deploy.

## 9. Post-deploy security

- [ ] Remove `SEED_ADMIN_PASSWORD` from `.env` after admin login works
- [ ] Confirm UFW allows only 22, 80, 443
- [ ] Restrict Aiven access to droplet IP if your plan supports it
- [ ] Set up uptime monitoring on `https://yourdomain.com/api/health`

## Day-2 commands

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f backend

# Manual redeploy
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Reset admin password
docker compose -f docker-compose.prod.yml exec backend node src/db/resetAdminPassword.js
```
