# Skill: SSL & Reverse Proxy (Hostinger VPS)

Automate SSL termination and request routing for your Hostinger VPS using Nginx or Caddy.

## Usage Procedure

### 1. Identify SSL Requirement
- **Goal**: Enable HTTPS for the MERN app to allow `secure: true` cookies and encrypted traffic.
- **Tools**: Nginx + Certbot (Classic) or Caddy (Automated).

### 2. Provide the Reverse Proxy Configuration
**Option A: Caddy (Recommended for Low-RAM KVM 1)**
Caddy is efficient and handles SSL automatically.

```bash
# Caddyfile on Hostinger KVM
yourdomain.com {
    reverse_proxy localhost:5000
    
    # Custom error pages (Optional)
    handle_errors {
        rewrite * /{err.status_code}.html
        file_server
    }
}
```

**Option B: Nginx + Certbot (Standard)**
The classic approach for granular control.

```nginx
# /etc/nginx/sites-available/mern-app
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Execution Commands
**To install and enable SSL with Nginx:**

```bash
# Install Certbot for Nginx
sudo apt update && sudo apt install certbot python3-certbot-nginx -y

# Get SSL Certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal check
sudo certbot renew --dry-run
```

**To use Caddy (Dockerized):**

```yaml
# Add to docker-compose.yml
services:
  caddy:
    image: caddy:latest
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

## SSL & Proxy Checklist:
- [ ] **DNS**: Domain A-Record is pointed to the Hostinger VPS IP.
- [ ] **Ports**: Verify UFW allows 80 and 443.
- [ ] **Cookies**: Ensure `NODE_ENV=production` is set so your app emits `secure: true` cookies.
- [ ] **Forwarding**: Verify `X-Forwarded-Proto` header is set so Express `req.secure` works correctly.
