# pages/ — Application Pages

Each file here is a full page component rendered by React Router when the user navigates to its URL.

---

## 📄 `Home.jsx`

**URL:** `/`
**Access:** Public (everyone can see)

**What it does:** The landing page — shows a hero section and a grid of all public events.

**How it works:**
1. On mount, calls `GET /api/events` to fetch all events
2. Renders a **hero section** with gradient background, welcome text, and CTA buttons
   - Logged-out users see "Get Started" and "Sign In"
   - Logged-in users see "Go to Dashboard"
3. Displays events as **cards** in a responsive grid (3 columns on desktop, 1 on mobile)

**Each event card shows:**
- Event image (or fallback placeholder)
- Department badge
- Fee badge (if fees > 0)
- Event name, tagline, description snippet
- Location and team size
- "View Details" button → links to `/events/:id`

**React concepts used:** `useState`, `useEffect`, conditional rendering, `map()` for lists.

---

## 📄 `Login.jsx`

**URL:** `/login`
**Access:** Public

**What it does:** Login form with email and password.

**How it works:**
1. User fills in email and password
2. On submit → calls `login(email, password)` from AuthContext
3. AuthContext calls `POST /api/auth/login` → receives JWT token
4. After success → redirects:
   - Admin/Coordinators → `/dashboard`
   - Students → `/` (home page)
5. If login fails → shows error message

**UI:** Uses glassmorphism effect (frosted glass card) for a premium look.

---

## 📄 `Register.jsx`

**URL:** `/register`
**Access:** Public

**What it does:** Registration form (name, email, phone, password).

**How it works:**
1. User fills in all fields
2. On submit → calls `register()` from AuthContext
3. AuthContext calls `POST /api/auth/register`
4. Backend creates user with role `'student'` and returns JWT token
5. Frontend uses `loginWithToken()` to auto-login the user immediately
6. Redirects to home page — **no need to go to login page again**

---

## 📄 `Dashboard.jsx`

**URL:** `/dashboard`
**Access:** Admin/Coordinators only

**What it does:** Shows live summary statistics from the database.

**How it works:**
1. On mount, calls multiple APIs in parallel using `Promise.all()`:
   - `GET /api/institutes` → count
   - `GET /api/departments` → count
   - `GET /api/events` → count
   - `GET /api/users` → count (admin only)
2. Displays counts in styled **stat cards** with icons
3. Role-based visibility — only admins see the Users count

---

## 📄 `EventDetails.jsx`

**URL:** `/events/:id`
**Access:** Public (everyone can view), Authenticated users can register groups

**What it does:** Full detail page for a single event — PLUS inline group & participant management.

**How it works:**
1. Reads event ID from URL using `useParams()`
2. Fetches in parallel: event details, groups, winners
3. Renders:
   - **Banner** with event image, department/institute badge, name, tagline
   - **About** section with full description
   - **Prizes** section (if prizes exist)
   - **Winners** section (if winners are declared — shows 🥇🥈🥉)
   - **"My Groups"** section (THE KEY FEATURE — see below)
   - **All Registered Groups** list with participant counts
   - **Quick Details** sidebar (location, team size, fees)
   - **Coordinators** sidebar (faculty + student coordinator with phone/email)
   - **"Register a Group"** button → opens modal

**"My Groups" section (student participant management):**
- Shows only if the logged-in user owns groups in this event
- Each group is an expandable accordion:
  - Click to expand → shows current participant table + add member form
  - **Member count badge**: green if minimum reached, yellow if not
  - **Add Member form**: name, enrollment, phone, email, institute, city, leader checkbox
  - **Remove** button per participant
  - **Delete group** button
  - Shows "Team is full" if max participants reached

**This is how students add team members to their groups.**

---

## 📄 `MyGroups.jsx`

**URL:** `/my-groups`
**Access:** Any authenticated user

**What it does:** Shows ALL groups the current user has created across ALL events.

**How it works:**
1. Calls `GET /api/groups/my` which returns the user's own groups
2. Displays each as a card showing:
   - Event name badge
   - Group name
   - Payment status (Paid/Unpaid)
   - Member count vs maximum
   - Location and fees
   - Warning if minimum members not yet added
3. Each card has a "Manage Team Members" button → links to the EventDetails page

---

## 📄 `InstitutesList.jsx`

**URL:** `/institutes`
**Access:** Admin only

**What it does:** Full CRUD page for managing institutes.

**Features:**
- Table listing all institutes (name, city, coordinator)
- "Add Institute" button → opens form modal
- Edit button on each row → pre-fills modal with existing data
- Delete button with confirmation dialog
- Coordinator assignment via dropdown (lists all users)

**CRUD flow:**
| Action | API Call |
|--------|----------|
| List | `GET /api/institutes` |
| Create | `POST /api/institutes` |
| Update | `PATCH /api/institutes/:id` |
| Delete | `DELETE /api/institutes/:id` |

---

## 📄 `DepartmentsList.jsx`

**URL:** `/departments`
**Access:** Admin / Institute Coordinator

**What it does:** Full CRUD for departments. Same pattern as InstitutesList but with institute selection and description field.

**Additional features:**
- Institute dropdown (which institute does this department belong to)
- Description field in the form
- Shows institute name in the table

---

## 📄 `EventsManager.jsx`

**URL:** `/events-manager`
**Access:** Admin / Coordinators

**What it does:** Full CRUD for events with all event-specific fields.

**Form fields:**
- Event name, tagline, description
- Department selection (dropdown)
- Coordinator assignment
- Location, fees, min/max participants, max groups
- Student coordinator name, phone, email
- Prizes text
- Image URL

---

## 📄 `GroupsManager.jsx`

**URL:** `/groups-manager`
**Access:** Admin / Event Coordinator

**What it does:** Admin view for managing all groups and their participants across events.

**Features:**
1. **Event selector** dropdown at top → shows groups for selected event
2. Groups table with columns:
   - Group name
   - Created by (who registered)
   - Member count (with min/max badge)
   - Payment toggle button (green/grey)
   - Attendance toggle button
3. **Actions per group:**
   - 👥 Manage Participants → opens modal with participant table + add form
   - ✏️ Edit group name → opens edit modal
   - 🗑️ Delete group

**Participants modal:** Same add/remove interface as EventDetails but for admins/coordinators.

---

## 📄 `WinnersManager.jsx`

**URL:** `/winners-manager`
**Access:** Admin / Event Coordinator

**What it does:** Declare and manage 1st, 2nd, 3rd place winners for events.

**Features:**
1. Event selector dropdown
2. Winners table showing: Place (🥇🥈🥉), Group Name, Participants count
3. "Declare Winner" form on the right:
   - Place selector (only shows unfilled positions)
   - Group selector (all groups for the event)
4. Edit button → opens modal to change place or group
5. Delete button to remove winner

---

## 📄 `UsersManager.jsx`

**URL:** `/users-manager`
**Access:** Admin only

**What it does:** Admin page for managing all users in the system.

**Features:**
- Search bar (search by name or email)
- Role filter dropdown
- Users table: name, email, phone, role, status (active/inactive)
- **Toggle active status** — activate/deactivate users
- **Edit user** → modal to change name, phone, role
- **Delete user** with confirmation

---

## 🔄 Common Patterns Across All CRUD Pages

1. **State management:** `useState` for data, loading, forms, modals
2. **Data fetching:** `useEffect` + `axios.get()` on component mount
3. **Form handling:** Controlled inputs with `onChange` → `setFormData`
4. **Modal pattern:** `showModal` boolean + `setShowModal(true/false)`
5. **Edit vs Create:** `editingId` state — if set, form submits PATCH; if null, submits POST
6. **Error handling:** `try/catch` with `alert()` for user feedback
7. **Loading state:** Spinner shown while data loads
