# Frontend — React + Vite Application

This is the **client-side** single-page application (SPA) built with React and served by Vite.

---

## 📁 Folder Structure

```
frontend/
├── public/                  ← Static assets (served as-is)
│   └── vite.svg             ← Default Vite icon
├── src/                     ← All React source code
│   ├── components/          ← Reusable UI components
│   │   ├── Navbar.jsx       ← Navigation bar with role-based menu
│   │   └── ProtectedRoute.jsx ← Route guard for auth + roles
│   ├── context/
│   │   └── AuthContext.jsx  ← Global authentication state
│   ├── pages/               ← 12 application pages
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── InstitutesList.jsx
│   │   ├── DepartmentsList.jsx
│   │   ├── EventsManager.jsx
│   │   ├── EventDetails.jsx
│   │   ├── GroupsManager.jsx
│   │   ├── WinnersManager.jsx
│   │   ├── UsersManager.jsx
│   │   └── MyGroups.jsx
│   ├── App.jsx              ← Main component with routing
│   ├── App.css              ← App-specific styles
│   ├── index.css            ← Global design system
│   └── main.jsx             ← React entry point
├── index.html               ← HTML shell
├── vite.config.js           ← Vite configuration
├── eslint.config.js         ← ESLint code quality rules
├── package.json             ← Dependencies & scripts
├── package-lock.json        ← Exact dependency versions
└── .gitignore               ← Files excluded from git
```

---

## 📄 Root Files Explained

### `index.html` — HTML Shell
**What it does:** The single HTML file that the entire React app loads into.

**Key elements:**
- **Meta tags** for SEO: charset, viewport, description, keywords, author
- **Google Fonts** link for "Inter" font family
- **`<div id="root">`** — React mounts the entire application inside this div
- **`<script type="module" src="/src/main.jsx">`** — tells the browser to load the React app

**How it works:** When the browser opens this file, it loads `main.jsx`, which renders `<App />` inside the `#root` div. From there, React takes over all UI rendering.

---

### `vite.config.js` — Build Tool Configuration
**What it does:** Configures Vite (the build tool) with React support.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],    // Enables JSX transformation and React Fast Refresh
})
```

**Why Vite?** Vite is much faster than Create React App (CRA). It uses native ES modules for instant dev server startup and hot module replacement (HMR).

---

### `package.json` — Dependencies

**Scripts:**
| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts Vite dev server at `http://localhost:5173` |
| `npm run build` | Creates production build in `dist/` folder |
| `npm run preview` | Preview the production build locally |

**Dependencies explained:**
| Package | Why |
|---------|-----|
| `react` + `react-dom` | Core React library |
| `react-router-dom` | Client-side routing (page navigation without reload) |
| `react-bootstrap` + `bootstrap` | Pre-built responsive UI components (Button, Modal, Table, etc.) |
| `axios` | HTTP client to call backend REST APIs |
| `lucide-react` | Modern, lightweight SVG icon library |

---

### `eslint.config.js` — Code Quality
Configures ESLint to check JavaScript/React code for common mistakes and style issues. Uses `@eslint/js` recommended rules plus React-specific rules.

---

### `.gitignore` — Files Excluded From Git
Excludes: `node_modules/` (too large), `dist/` (build output), `.env` files (secrets), and IDE config files.
