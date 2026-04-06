# Skill: KVM Resource Optimization (Hostinger KVM 1)

Optimize Node.js and Redis performance for limited-resource VPS environments (KVM 1 usually has 1-2GB RAM).

## Usage Procedure

### 1. Identify the Resource Constraint
- **Issue**: High RAM usage leading to OOM (Out Of Memory) kills or swap thrashing.
- **Goal**: Tune services to stay within the KVM 1 constraints while maintaining stability.

### 2. Provide the Hardened/Optimized Configuration
**Node.js Memory Tuning:**
Set the maximum heap size in your `package.json` or `docker-compose.yml` to prevent the process from exceeding available physical RAM.

```bash
# In package.json start script
"start": "node --max-old-space-size=512 dist/index.js"

# OR in docker-compose.yml
services:
  backend:
    command: node --max-old-space-size=512 server.js
    deploy:
      resources:
        limits:
          memory: 768M
```

**Redis Low-RAM Tuning:**
Modify `/etc/redis/redis.conf` or use a custom `redis.conf` in Docker to minimize footprint.

```conf
# redis-low-ram.conf
maxmemory 128mb
maxmemory-policy allkeys-lru
save "" # Disable background snapshots if not critical (reduces CPU/IO)
appendonly no # Use only if persistence isn't required for session/cache
```

### 3. Monitoring Commands (Hostinger specific)
Use these commands to check real-time resource pressure:

```bash
# 1. Check RAM and Swap usage
free -m

# 2. Monitor per-process CPU/RAM with human-readable output
top -b -n 1 | head -n 20

# 3. Check Docker container resource usage
docker stats --no-stream
```

## Optimization Checklist:
- [ ] **Node.js**: Set `--max-old-space-size` to ~50-60% of available container RAM.
- [ ] **Redis**: Set `maxmemory` and `maxmemory-policy` to prevent infinite growth.
- [ ] **Swap**: Ensure Hostinger KVM has a swap file (e.g., 2GB) to handle peaks.
- [ ] **GC**: For very tight RAM, use `--expose-gc` and trigger manually during low-traffic periods (Advanced).
