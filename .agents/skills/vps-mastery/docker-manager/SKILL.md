# Skill: Docker Manager for Hostinger

Automate the lifecycle of your MERN application on Hostinger using Docker Compose and zero-downtime scripts.

## Usage Procedure

### 1. Identify Deployment Goal
- **Goal**: Deploy MERN app + MongoDB + Redis with no public exposure of the data layer.
- **Workflow**: Automated updates from GitHub with minimal disruption.

### 2. Provide the Deployment Configuration
**Hardened docker-compose.yml (Private Network):**

```yaml
version: '3.8'

services:
  app:
    build: .
    restart: always
    environment:
      - MONGO_URI=mongodb://db:27017/prod
      - REDIS_URL=redis://cache:6379
    networks:
      - production-net
    ports:
      - "127.0.0.1:5000:5000" # Internal only, Nginx/Caddy proxies here

  db:
    image: mongo:latest
    restart: always
    volumes:
      - mongo-data:/data/db
    networks:
      - production-net
    # No ports mapped to public IP

  cache:
    image: redis:alpine
    restart: always
    networks:
      - production-net
    # No ports mapped to public IP

networks:
  production-net:
    driver: bridge # Private internal bridge

volumes:
  mongo-data:
```

**Zero-Downtime Redeploy Script (`deploy.sh`):**
This script triggers a pull and a background build to minimize the gap between image swaps.

```bash
#!/bin/bash
# deploy.sh

echo "--- Starting Deployment to Hostinger KVM ---"

# 1. Pull latest code
git pull origin main

# 2. Build new images and restart changed services
docker-compose up -d --build --remove-orphans

# 3. Prune old images to save Hostinger KVM space
docker image prune -f

echo "--- Deployment Complete ---"
```

### 3. Execution Commands
On the Hostinger VPS:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Docker Management Checklist:
- [ ] **Networks**: Ensure `production-net` is used across all services.
- [ ] **Volumes**: Persist `mongo-data` and `redis-data` for data durability across restarts.
- [ ] **Pruning**: Hostinger KVM 1 has small disks; always `docker image prune` after builds.
- [ ] **Healthchecks**: Add healthchecks to `docker-compose` to ensure containers are ready before traffic hits.
