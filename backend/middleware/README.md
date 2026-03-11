# middleware/ — Authentication & Authorization

This folder contains Express middleware functions that run before route handlers to verify identity and permissions.

---

## 📄 `auth.js`

**What it does:** Provides two middleware functions:
1. **`protect`** — Verifies the user is logged in (has a valid JWT token)
2. **`authorize`** — Checks if the logged-in user has the required role

---

### `protect` — Authentication Middleware

**How it works step by step:**

1. Reads the `Authorization` header from the incoming HTTP request
2. Checks if it starts with `Bearer ` and extracts the token after it
3. If no token found → returns 401 (Unauthorized)
4. Calls `jwt.verify()` to decode and validate the token using the secret key
5. Extracts the `user ID` from the decoded token
6. Fetches the full user object from MongoDB using `User.findById()`
7. Checks if the user exists and is active (`isActive: true`)
8. Attaches the user to `req.user` so all subsequent route handlers can access it
9. Calls `next()` to continue to the actual route handler

**Example of how a request flows:**
```
Client sends: GET /api/events-manager
Headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." }

→ protect() middleware runs first
→ Extracts token: "eyJhbGciOiJIUzI1NiIs..."
→ jwt.verify() decodes it: { id: "507f1f77bcf86cd799439011", role: "admin" }
→ Finds user in DB: { name: "John", email: "john@test.com", role: "admin" }
→ Sets req.user = that user object
→ next() → route handler now has access to req.user
```

---

### `authorize(...roles)` — Role-Based Authorization Middleware

**How it works:**
1. Takes a list of allowed roles as arguments (e.g., `'admin'`, `'eventCoord'`)
2. Returns a middleware function that checks `req.user.role` against the allowed list
3. If user's role is in the list → calls `next()` (allowed)
4. If not → returns 403 (Forbidden)

**Usage in routes:**
```javascript
// Only admin and eventCoord can access this route
router.post('/events/:eventId/winners', protect, authorize('admin', 'eventCoord'), handler);

// 1. protect() runs first → verifies JWT token → sets req.user
// 2. authorize('admin', 'eventCoord') runs → checks req.user.role
// 3. If role matches → handler runs
// 4. If role doesn't match → 403 error returned
```

**Why two separate functions?**
- `protect` answers: "Is this person logged in?"
- `authorize` answers: "Does this person have permission?"
- They are used together: `protect` always runs first, then `authorize` checks the role.
