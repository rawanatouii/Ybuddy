#!/usr/bin/env bash
# One-time bootstrap for a fresh Debian 12 VPS (run once, as root, via SSH).
# Safe to re-run — every step is idempotent.
set -euo pipefail

echo "==> Updating system packages"
apt-get update -y
apt-get upgrade -y

echo "==> Checking Docker"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found, installing (OVH's 'Debian 12 - Docker' image ships with it already)"
  curl -fsSL https://get.docker.com | sh
else
  echo "Docker already installed: $(docker --version)"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin missing, installing"
  apt-get install -y docker-compose-plugin
else
  echo "Docker Compose already installed: $(docker compose version)"
fi

echo "==> Configuring firewall (ufw)"
apt-get install -y ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

echo "==> Installing fail2ban (SSH brute-force protection)"
apt-get install -y fail2ban
systemctl enable --now fail2ban

echo "==> Ensuring swap exists (cheap insurance on a 4GB box during image builds)"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "2G swapfile created"
else
  echo "Swap already configured"
fi

echo "==> Creating app directory"
mkdir -p /opt/ybuddy

echo ""
echo "Done. Next steps:"
echo "  1. Point your domain's DNS A record at this server's IP"
echo "  2. git clone <your-repo-url> /opt/ybuddy   (or scp the code over)"
echo "  3. cd /opt/ybuddy"
echo "  4. cp .env.prod.example .env && edit it with real values"
echo "  5. cp backend/.env.prod.example backend/.env && edit it with real values"
echo "  6. ./deploy/deploy.sh"
