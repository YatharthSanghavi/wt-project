# context/ — Global State Management

This folder uses **React Context API** to share authentication state across all components without passing props manually.

---

## 📄 `AuthContext.jsx`

**What it does:** Manages the entire authentication flow — login, logout, register, and user state.

**How React Context works:**
1. `createContext()` creates a "container" for shared data
2. `AuthProvider` wraps the entire app and provides the data
3. Any component can call `useAuth()` to access the data

**State managed:**
| State | Type | Purpose |
|-------|------|---------|
| `user` | Object/null | The currently logged-in user (name, email, role) |
| `token` | String/null | The JWT token for API calls |
| `loading` | Boolean | True while checking if user is already logged in |

**Functions provided:**
| Function | What it does |
|----------|-------------|
| `login(email, password)` | Sends POST to `/api/auth/login`, stores token + user |
| `loginWithToken(token, user)` | Sets auth state directly (used after registration) |
| `register(name, email, phone, password)` | Sends POST to `/api/auth/register` |
| `logout()` | Clears token and user state |

**How token persistence works:**
1. On login → token is stored in `localStorage` (browser storage that survives page refreshes)
2. On page load → `useEffect` reads token from `localStorage`
3. If token exists → sets `Authorization: Bearer <token>` header on ALL Axios requests
4. Calls `GET /api/auth/me` to fetch full user data from the backend
5. If token is invalid/expired → calls `logout()` to clear everything

**Axios baseURL setup:**
```javascript
axios.defaults.baseURL = 'http://localhost:5000/api';
```
This means every `axios.get('/events')` actually calls `http://localhost:5000/api/events`.

**How other components use it:**
```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  // user.name, user.role, etc.
};
```
