---
name: database-architect
description: Strict standards for Mongoose models and controllers to ensure performance, scalability, and code quality.
---
# Database Architect Skill

This skill enforces high-performance, scalable, and clean-code standards for Mongoose models and Express controllers.

## 1. Schema Optimization (The "Index" Guard)
- **Filtering**: Every field used for filtering (e.g., `email`, `username`, `slug`, `createdAt`) MUST have an `{ index: true }`.
- **Identity Enforcement**: Use `{ unique: true }` for identity fields to prevent data duplication and race conditions.
- **Audit**: If you detect a `find()` or `findOne()` query on a non-indexed field, you MUST warn the user and suggest an index.

## 2. Scalable Pagination Strategy
- **No Uncapped Reads**: Never use `.find()` without a `.limit()`.
- **Patterns**: Implement Cursor-based pagination or Offset pagination (using `limit` and `skip`).
- **Safeguards**: Default all list queries to a maximum of 20 documents to prevent memory exhaustion on limited resource hosts (like KVM/VPS).

## 3. Clean & Quality Code (SOLID Principles)
- **Validation**: Use **Zod** schemas for incoming data validation *before* it reaches the model.
- **Service Layering**: Keep controllers "Skinny" and models "Fat." Business logic should live in Mongoose **Statics** or **Methods**, not in the Express route handlers.
- **Async Handling**: Use `express-async-handler` to ensure clean, centralized error handling (avoid `try/catch` clutter).

## 4. Performance Auditing (The EXPLAIN Skill)
- **Query Verification**: For any complex aggregation or query, generate a `.explain("executionStats")` test case to verify an **IXSCAN** (Index Scan) is occurring instead of a **COLLSCAN** (Collection Scan).

## 5. Efficient Resource Usage
- **Memory Optimization**: Use `.lean()` for all read-only queries to bypass Mongoose's document hydration (saves RAM).
- **Minimum Payload**: Only select necessary fields using `.select("-password -__v")` to reduce network payload and improve latency.

## Model Quality Report
Every time you create or update a Mongoose model, you MUST output the following report:

### 🛡️ Model Quality Report: [Model Name]
- [ ] **Indexing**: All filter-fields indexed?
- [ ] **Uniqueness**: Identity fields have `{ unique: true }`?
- [ ] **Pagination**: List routes use `.limit(20)`?
- [ ] **Validation**: Zod schema implemented for input?
- [ ] **Logic Location**: Fat Model (Statics/Methods) vs Skinny Controller?
- [ ] **Efficiency**: `.lean()` and `.select()` used for reads?
- [ ] **Explain Audit**: Query plan verified for IXSCAN?
