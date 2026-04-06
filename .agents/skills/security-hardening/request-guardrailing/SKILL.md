# Skill: Request Guardrailing (CORS, CSRF & Rate Limiting)

Protect the application from brute-force, CSRF, and misconfiguration attacks.

## Usage Procedure

### 1. Identify the Insecure Pattern
- **Vulnerability**: CORS allowed from all origins (`*`) or missing security headers.
- **OWASP Risk**: **A05:2021 – Security Misconfiguration**
- **Impact**: Cross-origin attackers can intercept requests or exploit browser vulnerabilities.

### 2. Provide the Hardened Code
**Hardened Middleware Configuration:**

```javascript
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 1. Helmet for Security Headers
app.use(helmet());

// 2. Strict CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','), // e.g., 'http://localhost:3000,https://app.com'
  credentials: true,
};
app.use(cors(corsOptions));

// 3. Auth Route Rate Limiting (Brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);
```

**Account Locking Logic:**
```javascript
// userModel.ts
const userSchema = new mongoose.Schema({
  // ...
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number }
});

userSchema.methods.incLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }
  return this.updateOne(updates);
};
```

### 3. Verify with Vitest Security Test
**Test Case for Rate Limiting & Account Locking:**

```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
// ... import app ...

describe('Request Guardrailing', () => {
  it('should block login after 5 failed attempts (Rate Limiter)', async () => {
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/auth/login').send({ email: 'locked@test.com', password: 'wrong' });
      if (i === 5) {
        expect(res.status).toBe(429); // Too Many Requests
      }
    }
  });

  it('should ensure Helmet headers are present', async () => {
    const res = await request(app).get('/');
    expect(res.headers).toHaveProperty('x-dns-prefetch-control');
    expect(res.headers).toHaveProperty('strict-transport-security');
  });
});
```

## Guardrailing Checklist:
- [ ] **Cors**: Ensure `ALLOWED_ORIGINS` env is used and `*` is never deployed.
- [ ] **Helmet**: Default usage is mandatory across all routes.
- [ ] **Rate Limiting**: Apply strictly to Auth and API endpoints. 
- [ ] **Locking**: Persist lock state in Database to prevent distributed brute-force.
