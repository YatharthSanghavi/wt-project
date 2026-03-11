# models/ — Mongoose Database Schemas

This folder defines the **structure of data** stored in MongoDB. Each file creates a **Mongoose Model** that acts as an interface to a MongoDB collection.

**What is a Model?** A model is like a blueprint for data. It defines what fields exist, what types they are, which are required, and what validations apply.

---

## 📄 `User.js`

**Collection:** `users`
**Purpose:** Stores all registered users (admins, coordinators, students).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | User's full name |
| `email` | String | ✅ | Unique, lowercase email |
| `phone` | String | ✅ | Contact number |
| `password` | String | ✅ | Hashed password (min 6 chars, `select: false` so it's hidden by default) |
| `role` | String (enum) | No | One of: `admin`, `instituteCoord`, `departmentCoord`, `eventCoord`, `student`, `participant` |
| `isActive` | Boolean | No | Default `true`. Admins can deactivate users |
| `createdAt` | Date | No | Auto-set to creation time |
| `modifiedAt` | Date | No | Auto-set, updated on changes |

**Special features:**
- **Pre-save hook:** Before saving a user, `bcrypt.hash()` automatically hashes the password with 12 salt rounds. This means the plain-text password is NEVER stored.
- **Instance method:** `comparePassword(candidatePassword)` — compares a plain-text password against the stored hash using `bcrypt.compare()`. Used during login.
- **`select: false`** on password field — means when you do `User.find()`, the password is NOT included. You must explicitly request it with `.select('+password')`.

---

## 📄 `Institute.js`

**Collection:** `institutes`
**Purpose:** Stores colleges/universities that participate in events.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `instituteName` | String | ✅ | Name of the institute |
| `city` | String | ✅ | City where it's located |
| `instituteImage` | String | No | URL of institute logo/image |
| `coordinatorId` | ObjectId → User | No | Reference to the user who coordinates this institute |
| `createdAt` | Date | No | Auto-set |
| `modifiedAt` | Date | No | Auto-set |
| `modifiedBy` | ObjectId → User | No | Who last modified this record |

**Relationship:** `coordinatorId` references the `User` model. When queried with `.populate('coordinatorId')`, it replaces the ID with the actual user data.

---

## 📄 `Department.js`

**Collection:** `departments`
**Purpose:** Each institute has multiple departments (e.g., Computer Science, Electronics).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `departmentName` | String | ✅ | Name of the department |
| `instituteId` | ObjectId → Institute | ✅ | Which institute this department belongs to |
| `departmentImage` | String | No | URL of department image |
| `description` | String | No | Description of the department |
| `coordinatorId` | ObjectId → User | No | Department coordinator |
| `createdAt`, `modifiedAt`, `modifiedBy` | — | No | Timestamps and audit fields |

**Relationship:** `instituteId` links this department to an institute (many-to-one).

---

## 📄 `Event.js`

**Collection:** `events`
**Purpose:** The core entity — competitions, hackathons, workshops, etc.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventName` | String | ✅ | Name of the event |
| `tagline` | String | No | Short catchy line |
| `description` | String | No | Full event description |
| `departmentId` | ObjectId → Department | ✅ | Which department hosts this event |
| `eventImage` | String | No | Event banner image URL |
| `fees` | Number | No | Registration fee per team (default 0) |
| `prizes` | String | No | Prize details (e.g., "1st: ₹5000") |
| `groupMinParticipants` | Number | ✅ | Minimum team size |
| `groupMaxParticipants` | Number | ✅ | Maximum team size |
| `eventLocation` | String | No | Venue/location |
| `maxGroupsAllowed` | Number | ✅ | Max teams that can register |
| `coordinatorId` | ObjectId → User | No | Faculty coordinator |
| `studentCoordinatorName` | String | No | Student coordinator name |
| `studentCoordinatorPhone` | String | No | Student coordinator phone |
| `studentCoordinatorEmail` | String | No | Student coordinator email |

**Pre-save validation:** Checks that `groupMinParticipants <= groupMaxParticipants`. If not, throws an error.

---

## 📄 `Group.js`

**Collection:** `groups`
**Purpose:** A team registered for an event.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupName` | String | ✅ | Team name |
| `eventId` | ObjectId → Event | ✅ | Which event this team registered for |
| `isPaymentDone` | Boolean | No | Whether the team has paid fees |
| `isPresent` | Boolean | No | Whether the team was present on event day |
| `createdBy` | ObjectId → User | No | The user who created (registered) this group |

**Business rules (enforced in routes, not model):**
- Cannot create more groups than `event.maxGroupsAllowed`
- Only the group creator or admin/coordinator can modify it

---

## 📄 `Participant.js`

**Collection:** `participants`
**Purpose:** Individual team members within a group.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `groupId` | ObjectId → Group | ✅ | Which group this person belongs to |
| `name` | String | ✅ | Full name |
| `enrollmentNumber` | String | ✅ | College enrollment/roll number |
| `instituteName` | String | ✅ | Their institute name |
| `city` | String | ✅ | Their city |
| `phone` | String | ✅ | Contact number |
| `email` | String | ✅ | Email (lowercase) |
| `isGroupLeader` | Boolean | No | Whether this person is the team leader |

**Business rules (enforced in routes):**
- Cannot exceed `event.groupMaxParticipants` members
- Only one `isGroupLeader: true` per group

---

## 📄 `EventWiseWinner.js`

**Collection:** `eventwisewinners`
**Purpose:** Stores 1st, 2nd, 3rd place winners for each event.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | ObjectId → Event | ✅ | Which event |
| `groupId` | ObjectId → Group | ✅ | Which group won |
| `sequence` | Number | ✅ | Place: 1, 2, or 3 |

**Compound unique index:** `{ eventId: 1, sequence: 1 }` — ensures no two groups can have the same place in the same event (e.g., can't have two 1st place winners).

---

## 🔗 Visual Relationship Map

```
User (coordinator) ──> Institute
                        │
                        ├──> Department ──> Event
                                             │
                                             ├──> Group ──> Participant
                                             │
                                             └──> EventWiseWinner
```
