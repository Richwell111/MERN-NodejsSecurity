# Skill: VPS & Infrastructure Deployment (Hostinger VPS)

Ensure secure deployment of MERN applications with proper secret management and network isolation.

## Usage Procedure

### 1. Identify the Insecure Pattern
- **Vulnerability**: Database exposed to the public internet (`0.0.0.0`) or secrets stored in Git.
- **OWASP Risk**: **A05:2021 – Security Misconfiguration**
- **Impact**: Attacker can brute-force the database or steal API keys from the codebase.

### 2. Provide the Hardened Code
**Production vs Local .env Pattern:**
- `.env.example`: Template for required keys.
- `.env.local`: For local development (ignored by Git).
- VPS Environment Variables: Set via Hostinger dashboard or CI/CD secrets (never in a file).

**Hardened Docker Compose (Isolated Network):**

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./server
      dockerfile: Dockerfile.prod
    ports:
      - "127.0.0.1:5000:5000" # Expose to localhost only (Reverse Proxy handles external traffic)
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://db:27017/mern-prod
    networks:
      - mern-network
    depends_on:
      - db

  db:
    image: mongo:latest
    # NO PORTS MAPPED - Database is ONLY accessible via the 'mern-network' internal Docker network
    volumes:
      - mongodb_data:/data/db
    networks:
      - mern-network
    healthcheck:
      test: ["CMD", "mongo", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  mern-network:
    driver: bridge # Internal bridge network for inter-container communication

volumes:
  mongodb_data:
```

### 3. Verify with Vitest Security Test
**Infrastructure Verification (Command-Line Based):**

```javascript
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Infrastructure Security Verification', () => {
  it('should ensure MongoDB port is NOT accessible from public interfaces', () => {
    try {
      // Try to port-scan localhost:27017 from outside Docker
      const result = execSync('nc -zv localhost 27017', { encoding: 'utf8' });
      // If it reaches here, the port is open (FAIL)
      expect(result).not.toContain('succeeded');
    } catch (error) {
      // Netcat failing to connect is a SUCCESS for security isolation
      expect(error.message).toContain('failed');
    }
  });

  it('should check if NODE_ENV is set to production in the environment', () => {
    expect(process.env.NODE_ENV).toBe('production');
  });
});
```

## Infrastructure Checklist:
- [ ] **Network Isolation**: Database service MUST NOT have a `ports` section in `compose.prod.yaml`.
- [ ] **Reverse Proxy**: Use Nginx or Caddy on the VPS to handle SSL/TLS and proxy to `127.0.0.1:5000`.
- [ ] **Secret Management**: Inject `JWT_SECRET`, `MONGO_URI`, etc., via the VPS provider's environment config.
- [ ] **Least Privilege**: Application container should run as a non-root user.
