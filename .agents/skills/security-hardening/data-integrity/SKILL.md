# Skill: Data Integrity & NoSQL Injection Defense

Ensure all incoming data is valid and prevent NoSQL injection via MongoDB operator sanitization.

## Usage Procedure

### 1. Identify the Insecure Pattern
- **Vulnerability**: Unvalidated `req.body` or direct use of user-supplied objects in MongoDB queries.
- **OWASP Risk**: **A03:2021 – Injection**
- **Impact**: Attackers can inject operators like `$gt`, `$ne`, or `$regex` to bypass logic or leak data.

### 2. Provide the Hardened Code
**Hardened Validation & Sanitization:**

```javascript
import { z } from 'zod';

// 1. Define Strict Schema
const UserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
}).strict(); // Reject unknown properties

// 2. Validation Middleware
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  req.body = result.data; // Data is now typed and sanitized
  next();
};

// 3. NoSQL Operator Sanitization Utility
export const sanitizeQuery = (obj: any) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else {
        sanitizeQuery(obj[key]);
      }
    }
  }
  return obj;
};
```

**Implementation in Controller:**
```javascript
// Auth Controller
const { email, password } = req.body;
// UserLoginSchema with .strict() already removed any non-string fields or objects
const user = await User.findOne({ email });
```

### 3. Verify with Vitest Security Test
**Test Case for Zod Validation & NoSQL Injection:**

```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
// ... import app ...

describe('Data Integrity Protection', () => {
  it('should reject extra/unwanted fields (strict schema)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@ext.com', password: 'Password123!', role: 'admin' }); // role shouldn't be here
    
    expect(res.body.errors.fieldErrors).toHaveProperty('role'); // Or ensure 'admin' wasn't set
  });

  it('should prevent operator injection via sanitization', async () => {
    const maliciousInput = { email: { $gt: '' }, password: 'somepassword' };
    const res = await request(app)
      .post('/api/auth/login')
      .send(maliciousInput);
    
    expect(res.status).toBe(400); // Should be caught by Zod schema
  });
});
```

## Data Integrity Checklist:
- [ ] **Zod Schema**: Defined for ALL POST/PUT endpoints.
- [ ] **Strictness**: Use `.strict()` to prevent mass-assignment vulnerabilities.
- [ ] **Sanitization**: Use `mongo-sanitize` or manual recursive deletion for query parameters.
- [ ] **Type Mapping**: Ensure `req.body` properties are cast to expected types (e.g., `String()`) before database usage.
