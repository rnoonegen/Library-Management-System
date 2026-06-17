# Frontend Folder Structure

This project uses the standard React (CRA) layout you requested.

```
src/
├── assets/
│   └── styles/          # Theme CSS, MUI theme config
├── components/          # Reusable UI — one folder per component
│   ├── Button/
│   │   └── Button.jsx
│   ├── Modal/
│   │   └── Modal.jsx
│   └── ...
├── pages/               # Screens — compose components here
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Books.jsx
│   └── user/
│       ├── UserBooks.jsx
│       └── ...
├── layouts/
│   └── MainLayout.jsx   # Sidebar + header shell
├── routes/
│   └── Routes.jsx       # All route definitions
├── services/
│   └── api.js           # API calls
├── hooks/
│   └── useDbMode.js
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── App.jsx
└── index.jsx
```

## Flow (how to build a screen)

1. **Page** (`pages/`) — main screen file; fetches data, handles state.
2. **Components** (`components/`) — reusable pieces used by pages (Button, Modal, forms).
3. **Layout** (`layouts/`) — wraps pages with sidebar/header (not repeated in every page).
4. **Routes** (`routes/Routes.jsx`) — maps URLs to pages.
5. **Services** (`services/api.js`) — all backend HTTP calls.
6. **Context** (`context/`) — global state (auth, theme).

Example: `pages/Books.jsx` imports `SearchBar`, `Modal`, and calls `api.getBooks()`.

## Naming rules

| Item | Convention | Example |
|------|------------|---------|
| Component folder | PascalCase, same as component | `Button/Button.jsx` |
| Page file | PascalCase | `Login.jsx`, `Dashboard.jsx` |
| User pages | `User` prefix in `pages/user/` | `UserBooks.jsx` |
| Hooks | `use` prefix | `useDbMode.js` |
| Services | camelCase | `api.js` |
| Context | `Context` suffix | `AuthContext.jsx` |

## Imports

`jsconfig.json` sets `"baseUrl": "src"`:

```js
import Button from 'components/Button/Button';
import { api } from 'services/api';
import { useAuth } from 'context/AuthContext';
```

## Why there is no `shared/` folder

`shared/` is used in large apps to mean “code used by many features.” In this structure, that role is already covered by:

- `components/` — reusable UI
- `services/` — API layer
- `hooks/` — reusable logic
- `context/` — global state

Keeping those top-level folders is simpler and matches the layout you follow across projects.
