# scripts/ — Utility Scripts

This folder contains helper scripts for development and testing. These are NOT part of the running application — they are standalone scripts you run manually.

---

## 📄 `seedDatabase.js`

**What it does:** Populates the database with sample/initial data for testing and development.

**How to run:**
```bash
cd backend
node scripts/seedDatabase.js
```

**What it creates:**
1. **Admin user** — `admin@frolic.com` with role `admin`
2. **Institute Coordinator** — `instcoord@frolic.com` with role `instituteCoord`
3. **Department Coordinator** — `deptcoord@frolic.com` with role `departmentCoord`
4. **Event Coordinator** — `eventcoord@frolic.com` with role `eventCoord`
5. **Student user** — `student@frolic.com` with role `student`
6. **Sample Institute** — "Darshan University" in Rajkot
7. **Sample Department** — "Computer Science" under the institute
8. **Sample Events** — Events linked to the department

**How it works:**
1. Connects to MongoDB using the same connection string as the server
2. Clears all existing data (optional — depends on implementation)
3. Creates users with `User.create()` — passwords are auto-hashed by the User model
4. Creates sample institutes, departments, and events with proper references between them
5. Logs the created data to the console

**When to use:**
- First time setting up the project
- When you need to reset the database to a known state
- When demonstrating the project to faculty

---

## 📄 `testAPIs.js`

**What it does:** Automatically tests all the API endpoints to verify they work correctly.

**How to run:**
```bash
cd backend
# Make sure the server is running first!
node scripts/testAPIs.js
```

**What it tests:**
1. **Auth:** Register a new user, login with credentials
2. **Institutes:** Create, list, get by ID
3. **Departments:** Create linked to institute
4. **Events:** Create linked to department
5. **Users:** List all users, test pagination
6. **Cleanup:** Deletes created test data after tests complete

**How it works:**
- Uses `axios` to make HTTP requests to `http://localhost:5000/api`
- Stores the JWT token from login and includes it in subsequent requests
- Logs success/failure for each test
- Tests the correct response structure (`res.data.token`, `res.data.data`, etc.)

**Key concepts:**
- `axios.post()` — sends POST request with data
- `axios.get()` — sends GET request
- `Authorization: Bearer ${token}` — sends the JWT in headers
