# Skill: Auth Flow Hardening (JWT & Cookies)

Implement secure authentication using a Dual-Token Strategy and hardened cookie configuration.

## Usage Procedure

### 1. Identify the Insecure Pattern
- **Vulnerability**: JWTs stored in localStorage (XSS risk) or single long-lived token.
- **OWASP Risk**: **A01:2021 – Broken Access Control**
- **Impact**: Attacker can steal tokens via XSS and maintain persistent access.

### 2. Provide the Hardened Code
**Hardened Cookie Configuration & Storage Logic:**

```javascript
// Server-side: setting secure cookies
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Refresh Token Model (for rotation/revocation)
const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: { type: Date, required: true }
});
```

### 3. Verify with Vitest Security Test
**Test Case for Cookie Security:**

```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
// ... import app ...

describe('Auth Security Hardening', () => {
  it('should set httpOnly and secure flags on refresh token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' });

    const cookies = res.get('Set-Cookie');
    const refreshTokenCookie = cookies.find(c => c.includes('refreshToken'));

    expect(refreshTokenCookie).toContain('HttpOnly');
    expect(refreshTokenCookie).toContain('SameSite=Strict');
    if (process.env.NODE_ENV === 'production') {
      expect(refreshTokenCookie).toContain('Secure');
    }
  });

  it('should invalidate old refresh tokens after rotation', async () => {
    // 1. Login to get refreshToken
    // 2. Use refreshToken to get new Access/Refresh tokens
    // 3. Try to use OLD refreshToken again - should FAIL (rotation detection)
  });
});
```

## Requirements Checklist:
- [ ] **Dual-Tokens**: Short-lived Access Token (Memory/Response Body) + Long-lived Refresh Token (Cookie).
- [ ] **Secure Storage**: Refresh tokens stored in DB with association to User ID.
- [ ] **Revocation**: Mechanism to delete refresh tokens on logout or manual revocation.
- [ ] **Rotation**: Issue a new refresh token every time access token is refreshed.
