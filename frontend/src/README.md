# src/ — React Source Code

All application source code lives here. This is what gets compiled by Vite into the production bundle.

---

## 📄 `main.jsx` — Entry Point

**What it does:** The very first JavaScript file that runs.

**How it works:**
1. Imports `React` and `ReactDOM`
2. Imports `App` component and global CSS
3. Calls `ReactDOM.createRoot(document.getElementById('root')).render(<App />)`
4. This mounts the entire React application inside the `<div id="root">` in `index.html`

---

## 📄 `App.jsx` — Main Application Component

**What it does:** Defines the entire application structure — routing, layout, and which pages load on which URLs.

**How it works:**
1. Wraps everything in `<Router>` for client-side navigation
2. Wraps in `<AuthProvider>` to make user authentication available everywhere
3. Renders `<Navbar />` at the top of every page
4. Defines `<Routes>` with all page mappings:

| URL Path | Component | Access |
|----------|-----------|--------|
| `/` | `<Home />` | Public |
| `/events/:id` | `<EventDetails />` | Public |
| `/login` | `<Login />` | Public |
| `/register` | `<Register />` | Public |
| `/my-groups` | `<MyGroups />` | Any authenticated user |
| `/dashboard` | `<Dashboard />` | Admin/Coordinators |
| `/events-manager` | `<EventsManager />` | Admin/Coordinators |
| `/institutes` | `<InstitutesList />` | Admin |
| `/users-manager` | `<UsersManager />` | Admin |
| `/departments` | `<DepartmentsList />` | Admin/InstituteCoord |
| `/groups-manager` | `<GroupsManager />` | Admin/EventCoord |
| `/winners-manager` | `<WinnersManager />` | Admin/EventCoord |

**`<ProtectedRoute>`** wraps routes that require authentication. If the user is not logged in or doesn't have the right role, they are redirected.

---

## 📄 `index.css` — Global Design System

**What it does:** Defines the visual identity of the entire application.

**Key sections:**
- **CSS Custom Properties (`:root`)** — Color palette, font sizes, shadows, transitions
- **Google Fonts** — Uses "Inter" font for a modern look
- **Component styles:** Cards, buttons, tables, forms, modals, badges
- **Gradient backgrounds** — Used in hero section and auth pages
- **Glassmorphism** — Frosted glass effect on login/register forms
- **Animations** — `fadeInUp` for staggered element appearance
- **Responsive design** — Media queries for mobile/tablet
- **Custom scrollbar** — Styled scrollbar for modern look

---

## 📄 `App.css` — App-Specific Styles
Additional CSS specific to the App component structure (minimal, most styles are in `index.css`).

---

## 📁 Subdirectories

| Folder | Purpose |
|--------|---------|
| `components/` | Reusable UI building blocks (Navbar, ProtectedRoute) |
| `context/` | React Context API for global state (authentication) |
| `pages/` | Each page component (12 total) |

See the README.md inside each subdirectory for detailed file explanations.
