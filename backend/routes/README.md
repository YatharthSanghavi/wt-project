# routes/ — REST API Route Handlers

Each file in this folder defines a set of Express routes (API endpoints). Routes handle incoming HTTP requests, interact with the database via models, and return JSON responses.

**All routes follow this consistent response format:**
```json
{ "success": true/false, "message": "...", "data": {...} }
```

---

## 📄 `auth.js` — Authentication Routes

**Mounted at:** `/api/auth`

### `POST /api/auth/register` — User Registration
**Access:** Public (no login needed)

**How it works:**
1. Receives `name`, `email`, `phone`, `password` from request body
2. Checks if a user with that email already exists → 400 error if yes
3. Creates a new User in database (password auto-hashed by User model's pre-save hook)
4. Role is hardcoded to `'student'` for security (ignores any role sent by the client)
5. Generates a JWT token using `jwt.sign()` with the user's ID and role
6. Returns the token and user data

### `POST /api/auth/login` — User Login
**Access:** Public

**How it works:**
1. Receives `email` and `password`
2. Finds user by email with `.select('+password')` to include the hidden password field
3. Uses `user.comparePassword()` to check if the password matches the hash
4. If valid → generates JWT token and returns it with user data
5. If invalid → returns 401 error

### `GET /api/auth/me` — Get Current User
**Access:** Private (needs token)

**How it works:**
1. Extracts JWT from the Authorization header
2. Decodes it to get the user ID
3. Fetches the user from database and returns it

---

## 📄 `users.js` — User Management Routes

**Mounted at:** `/api/users`

### `GET /` — List All Users (Admin Only)
- Supports query filters: `?role=admin` and `?search=john`
- Search works on both name and email using regex (case-insensitive)

### `GET /:id` — Get User by ID
- Only the user themselves or admin can access

### `PATCH /:id` — Update User
- Normal users can only update: `name`, `phone`
- Admins can additionally update: `role`, `isActive`
- Uses a whitelist approach — only allowed fields are applied

### `DELETE /:id` — Delete User (Admin Only)

---

## 📄 `institutes.js` — Institute CRUD Routes

**Mounted at:** `/api/institutes`

### `GET /` — List Institutes (with Pagination & Search)
- **Pagination:** `?page=1&limit=10` — returns paginated results
- **Search:** `?search=darshan` — searches by institute name or city
- Returns: `{ data, total, page, pages }` for pagination metadata
- Populates `coordinatorId` with the coordinator's name and email

### `GET /:id` — Get Single Institute with its Departments
- Also fetches all departments belonging to this institute

### `GET /:id/summary` — Institute Summary (Reporting)
- Aggregates data across departments → events → groups → participants
- Returns total counts for dashboard/reporting

### `POST /` — Create Institute (Admin Only)
### `PATCH /:id` — Update Institute (Admin Only)
### `DELETE /:id` — Delete Institute (Admin Only)
- Cannot delete if departments exist under it

---

## 📄 `departments.js` — Department CRUD Routes

**Mounted at:** `/api/departments`

### `POST /` — Create Department
- **Authorization:** Admin or Institute Coordinator
- Validates that the institute exists
- Checks for duplicate department names within the same institute
- If user is `instituteCoord`, verifies they are actually the coordinator of that institute

### `PATCH /:id` — Update Department
- Department coordinators can only update their own department

### `DELETE /:id` — Delete Department (Admin Only)
- Cannot delete if events exist under it

---

## 📄 `events.js` — Event CRUD Routes

**Mounted at:** `/api/events`

### `GET /` — List Events (with Pagination, Search & Filter)
- **Pagination:** `?page=1&limit=10`
- **Search:** `?search=hackathon` — searches event name
- **Filter:** `?department=<id>` or `?location=Lab`
- Populates: department name, institute name, coordinator name

### `GET /:id` — Get Full Event Details
- Deep population: department → institute, coordinator

### `POST /` — Create Event (Admin/DeptCoord)
### `PATCH /:id` — Update Event
### `DELETE /:id` — Delete Event (Admin Only)

---

## 📄 `groups.js` — Group Registration Routes

**Mounted at:** `/api` (nested paths)

### `GET /events/:eventId/groups` — List Groups for an Event
- Returns each group with its participant count (computed dynamically)

### `POST /events/:eventId/groups` — Register a Group
- **Access:** Any authenticated user
- Checks if max groups limit is reached for the event
- Sets `createdBy` to the current user's ID

### `GET /groups/my` — Get Current User's Own Groups
- Returns all groups created by the logged-in user across all events
- Populates event details (name, participant limits, fees, location)

### `GET /groups/:id` — Get Group with Participants
### `PATCH /groups/:id` — Update Group
- Owner can update: `groupName`
- Admin/Coordinator can additionally update: `isPaymentDone`, `isPresent`

### `DELETE /groups/:id` — Delete Group
- Also deletes all participants in the group (`Participant.deleteMany`)

---

## 📄 `participants.js` — Participant Management Routes

**Mounted at:** `/api` (nested paths)

### `POST /groups/:groupId/participants` — Add Participant
**Authorization logic:**
1. Group owner (the user who created the group) can add members
2. Admin, event coordinator, department coordinator can also add

**Validations:**
- Cannot exceed `event.groupMaxParticipants`
- Only one group leader (`isGroupLeader: true`) per group

### `PATCH /participants/:id` — Update Participant
### `DELETE /participants/:id` — Remove Participant

---

## 📄 `winners.js` — Winner Declaration Routes

**Mounted at:** `/api` (nested paths)

### `POST /events/:eventId/winners` — Declare Winner
**Validations:**
- Sequence must be 1, 2, or 3
- No duplicate sequence for the same event (can't have two 1st place)
- Group must belong to the event
- Same group can't win twice in the same event
- If user is `eventCoord`, must be the actual coordinator of that event

### `PATCH /winners/:id` — Update Winner Record
### `DELETE /winners/:id` — Delete Winner (Admin Only)
