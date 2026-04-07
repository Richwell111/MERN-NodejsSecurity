---
name: secret-guard
description: Standards for managing secrets and API keys to prevent accidental leaks.
---
# Secret Guard Skill

This skill ensures that sensitive information like MongoDB URIs, JWT secrets, and API keys are never committed to version control.

## 1. Environment Variable Protection
- **Rule**: NEVER hardcode secrets in source code.
- **Rule**: Always use `.env` files for local development.
- **Rule**: Use ${VAR} syntax in `docker-compose.yml` instead of hardcoding values.

## 2. Git Hygiene
- **Rule**: Ensure `.gitignore` contains `.env`, `.env.local`, `.env.test`, `.env.production`.
- **Rule**: If a secret is accidentally committed, it MUST be rotated (changed) immediately. 

## 3. Secret Rotation Strategy
- **MongoDB**: Change the database user's password in MongoDB Atlas and update the URI in `.env`.
- **JWT**: Generate a new cryptographically strong `JWT_SECRET` (at least 32 characters).

## 4. Remediation Checklist
If a secret exposure is detected:
1. Update `.gitignore` to prevent future leaks.
2. Remove the secret from the current commit.
3. Use a tool like `bfg` or `git-filter-repo` to purge it from the entire git history.
4. Rotate (change) the secret immediately.

## "Secret Health Report" Template
When auditing a project for secrets:
```markdown
### 🔑 Secret Health Report
- [ ] **.gitignore check**: `.env` and sensitive files listed?
- [ ] **Hardcoding check**: No secrets found in `.ts`, `.js`, or `.yml` files?
- [ ] **History check**: Git history audited for past leaks?
- [ ] **Rotation status**: All compromised secrets rotated?
```
