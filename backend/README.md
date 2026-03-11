# Backend — Frolic Event Management API

This is the **Express.js + MongoDB** REST API server that powers the entire application.

---

## 📁 Folder Structure

```
backend/
├── config/
│   └── db.js                ← MongoDB connection function
├── middleware/
│   └── auth.js              ← JWT authentication & role authorization
├── models/                  ← 7 Mongoose schemas
│   ├── User.js
│   ├── Institute.js
│   ├── Department.js
│   ├── Event.js
│   ├── Group.js
│   ├── Participant.js
│   └── EventWiseWinner.js
├── routes/                  ← 8 REST API route files
│   ├── auth.js
│   ├── users.js
│   ├── institutes.js
│   ├── departments.js
│   ├── events.js
│   ├── groups.js
│   ├── participants.js
│   └── winners.js
├── scripts/                 ← Utility scripts
│   ├── seedDatabase.js
│   └── testAPIs.js
├── server.js                ← Main entry point
├── .env                     ← Environment variables
├── package.json             ← NPM dependencies & scripts
└── package-lock.json        ← Exact dependency versions
```

---

## 📄 Root Files Explained

### `server.js` — Main Entry Point
**What it does:** This is the file that starts the entire backend server.

**How it works step by step:**
1. Loads environment variables from `.env` using `dotenv`
2. Creates an Express app instance
3. Adds middleware: CORS (cross-origin), JSON body parser, rate limiter
4. Connects to MongoDB using Mongoose
5. Registers all 8 route files under `/api/` prefix
6. Sets up centralized error handling (catches Mongoose validation errors, duplicate keys, invalid IDs, JWT errors)
7. Starts listening on port 5000

**Key concepts used:**
- `express()` — creates the web server
- `mongoose.connect()` — connects to MongoDB
- `app.use()` — registers middleware and routes
- Rate limiting — limits each IP to 100 requests per 15 minutes

---

### `.env` — Environment Variables
**What it does:** Stores sensitive configuration that should NOT be committed to git.

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `PORT` | Server port number | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/frolic` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-super-secret-jwt-key` |
| `JWT_EXPIRE` | Token expiration time | `30d` |
| `NODE_ENV` | Environment mode | `development` |

**How it's used:** `require('dotenv').config()` in server.js loads these into `process.env`, then they're accessed as `process.env.PORT`, `process.env.JWT_SECRET`, etc.

---

### `package.json` — Dependencies & Scripts

**Scripts:**
| Command | What it does |
|---------|----|
| `npm start` | Runs `node server.js` (production) |
| `npm run dev` | Runs `nodemon server.js` (auto-restarts on file changes) |

**Dependencies explained:**
| Package | Version | Why we use it |
|---------|---------|---------------|
| `express` | ^4.18.2 | Web framework — handles HTTP requests, routing, middleware |
| `mongoose` | ^7.0.0 | MongoDB ODM — defines schemas, validates data, queries database |
| `jsonwebtoken` | ^9.0.0 | Creates & verifies JWT tokens for authentication |
| `bcryptjs` | ^2.4.3 | Hashes passwords before storing in database |
| `cors` | ^2.8.5 | Allows frontend (port 5173) to call backend (port 5000) |
| `dotenv` | ^16.0.3 | Loads `.env` file variables into `process.env` |
| `express-rate-limit` | ^8.3.0 | Prevents API abuse by limiting requests per IP |
| `axios` | ^1.13.2 | Used by test scripts to make HTTP requess |
| `nodemon` | ^2.0.22 | (Dev) Auto-restarts server when code changes |

---

## 🔌 API Endpoints Summary

### Auth (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Create new user account | Public |
| POST | `/login` | Login and get JWT token | Public |
| GET | `/me` | Get current logged-in user | Private |

### Users (`/api/users`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all users (search, filter) | Admin |
| GET | `/:id` | Get user by ID | Private |
| PATCH | `/:id` | Update user (name, phone, role) | Private/Admin |
| DELETE | `/:id` | Delete user | Admin |

### Institutes (`/api/institutes`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List institutes (pagination, search) | Public |
| GET | `/:id` | Get single institute | Public |
| GET | `/:id/summary` | Get institute stats (depts, events) | Public |
| POST | `/` | Create institute | Admin |
| PATCH | `/:id` | Update institute | Admin |
| DELETE | `/:id` | Delete institute | Admin |

### Departments (`/api/departments`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all departments | Public |
| GET | `/:id` | Get single department | Public |
| POST | `/` | Create department | Admin/InstCoord |
| PATCH | `/:id` | Update department | Admin/DeptCoord |
| DELETE | `/:id` | Delete department | Admin |

### Events (`/api/events`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List events (pagination, search, filter) | Public |
| GET | `/:id` | Get full event details | Public |
| POST | `/` | Create event | Admin/DeptCoord |
| PATCH | `/:id` | Update event | Admin/Coordinator |
| DELETE | `/:id` | Delete event | Admin |

### Groups (`/api/events/:eventId/groups`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events/:eventId/groups` | List groups for event | Public |
| POST | `/events/:eventId/groups` | Create group for event | Authenticated |
| GET | `/groups/my` | Get current user's groups | Authenticated |
| GET | `/groups/:id` | Get group with participants | Public |
| PATCH | `/groups/:id` | Update group (name, payment, attendance) | Owner/Coord |
| DELETE | `/groups/:id` | Delete group + participants | Owner/Admin |

### Participants (`/api/groups/:groupId/participants`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/groups/:groupId/participants` | List participants | Public |
| POST | `/groups/:groupId/participants` | Add participant to group | Owner/Coord |
| PATCH | `/participants/:id` | Update participant | Owner/Coord |
| DELETE | `/participants/:id` | Remove participant | Owner/Coord |

### Winners (`/api/events/:eventId/winners`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/events/:eventId/winners` | Get winners for event | Public |
| POST | `/events/:eventId/winners` | Declare winner (1st/2nd/3rd) | Admin/EventCoord |
| PATCH | `/winners/:id` | Update winner record | Admin/EventCoord |
| DELETE | `/winners/:id` | Delete winner record | Admin |
