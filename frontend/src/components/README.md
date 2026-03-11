# components/ — Reusable UI Components

These are shared components used across multiple pages.

---

## 📄 `Navbar.jsx`

**What it does:** The navigation bar displayed at the top of every page. It changes based on whether the user is logged in and their role.

**How it works:**
1. Uses `useAuth()` to get the current user
2. Renders the app logo + brand name ("FrolicEvents") as a link to home
3. Shows different navigation links based on user role:

**Navigation structure:**
| Link | Visible To | Destination |
|------|-----------|-------------|
| Home | Everyone | `/` |
| My Groups | All logged-in users | `/my-groups` |
| Dashboard | Coordinators + Admin | `/dashboard` |
| **Manage dropdown:** | | |
| → Institutes | Admin only | `/institutes` |
| → Users | Admin only | `/users-manager` |
| → Departments | Admin + InstituteCoord | `/departments` |
| → Events | All coordinators | `/events-manager` |
| → Groups & Participants | Admin + EventCoord | `/groups-manager` |
| → Winners | Admin + EventCoord | `/winners-manager` |

**Right side:**
- **Logged in:** Shows user name, role badge, and Logout button
- **Not logged in:** Shows Login and Sign Up buttons

**React Bootstrap components used:**
- `<BNavbar>` — responsive navbar container
- `<Nav.Link as={Link}>` — React Router links styled as nav items
- `<NavDropdown>` — expandable dropdown menu

---

## 📄 `ProtectedRoute.jsx`

**What it does:** A route guard that prevents unauthorized users from accessing certain pages.

**How it works:**
1. Receives `allowedRoles` prop (array of role strings)
2. Calls `useAuth()` to check if user is logged in
3. **If loading** → shows a spinner (waiting for auth check)
4. **If not logged in** → redirects to `/login`
5. **If logged in but wrong role** → redirects to `/` (home)
6. **If authorized** → renders `<Outlet />` which displays the child route's component

**Usage in App.jsx:**
```jsx
<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
  <Route path="/institutes" element={<InstitutesList />} />
</Route>
```
This means: only users with role `admin` can access `/institutes`. Anyone else is redirected.

**React Router concepts used:**
- `<Navigate to="/login" replace />` — programmatic redirect
- `<Outlet />` — renders the matched child route
