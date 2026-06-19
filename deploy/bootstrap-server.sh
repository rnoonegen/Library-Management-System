#!/usr/bin/env bash
# One-time bootstrap for Ubuntu 24.04 DigitalOcean Droplet
# Run as root: bash deploy/bootstrap-server.sh
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="${APP_DIR:-/opt/library}"
DOMAIN="${DOMAIN:-}"
REPO_URL="${REPO_URL:-}"

echo "==> Updating system packages"
apt update && apt upgrade -y

echo "==> Installing packages"
apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw git

echo "==> Installing Docker"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

apt install -y docker-compose-plugin

echo "==> Creating deploy user: ${DEPLOY_USER}"
if ! id "${DEPLOY_USER}" &>/dev/null; then
  adduser --disabled-password --gecos "" "${DEPLOY_USER}"
  usermod -aG sudo "${DEPLOY_USER}"
  usermod -aG docker "${DEPLOY_USER}"
fi

if [ -f /root/.ssh/authorized_keys ] && [ ! -f "/home/${DEPLOY_USER}/.ssh/authorized_keys" ]; then
  mkdir -p "/home/${DEPLOY_USER}/.ssh"
  cp /root/.ssh/authorized_keys "/home/${DEPLOY_USER}/.ssh/"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
  chmod 700 "/home/${DEPLOY_USER}/.ssh"
  chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"
fi

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "==> Creating app directory: ${APP_DIR}"
mkdir -p "${APP_DIR}"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "${APP_DIR}"

if [ -n "${REPO_URL}" ] && [ ! -d "${APP_DIR}/.git" ]; then
  echo "==> Cloning repository"
  sudo -u "${DEPLOY_USER}" git clone "${REPO_URL}" "${APP_DIR}"
fi

if [ -n "${DOMAIN}" ]; then
  NGINX_CONF="/etc/nginx/sites-available/library"
  sed "s/YOUR_DOMAIN/${DOMAIN}/g" "${APP_DIR}/deploy/nginx/library.conf" > "${NGINX_CONF}"
  ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/library
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
  echo "==> Nginx configured for ${DOMAIN}"
  echo "    After .env is ready and containers are running, run:"
  echo "    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi

echo ""
echo "Bootstrap complete."
echo ""
echo "Next steps (as ${DEPLOY_USER} user):"
echo "  1. su - ${DEPLOY_USER}"
echo "  2. cd ${APP_DIR}"
if [ -z "${REPO_URL}" ]; then
  echo "  3. git clone <your-repo-url> ."
fi
echo "  4. cp deploy/.env.production.example .env && nano .env"
echo "  5. docker compose -f docker-compose.prod.yml up -d --build"
echo "  6. curl http://127.0.0.1:5000/api/health"
if [ -n "${DOMAIN}" ]; then
  echo "  7. sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi
