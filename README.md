# 🏢 CA Firm Internal Web App

An internal web application for a CA firm to manage employee skills, services, and learning resources.

---

## 📁 Project Structure

```
ca-internal-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Firebase auth state
│   │   ├── hooks/
│   │   │   └── useAuth.js       # Custom auth hook
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── profile/
│   │   │   │   └── Profile.jsx
│   │   │   ├── services/
│   │   │   │   ├── Services.jsx
│   │   │   │   └── ServiceDetail.jsx
│   │   │   ├── employees/
│   │   │   │   └── Employees.jsx
│   │   │   ├── learning/
│   │   │   │   └── Learning.jsx
│   │   │   ├── resources/
│   │   │   │   └── Resources.jsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   ├── utils/
│   │   │   └── firebaseConfig.js
│   │   ├── App.jsx              ✅ DONE
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── backend/                     # (Phase 2 - after frontend complete)
    ├── routes/
    ├── controllers/
    ├── models/
    ├── middleware/
    └── server.js
```

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React | UI development |
| Vite | Fast build tool |
| Tailwind CSS | Styling |
| Axios | API calls |
| React Router v6 | Client-side routing |

### Backend *(Phase 2)*
| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | API framework |
| JWT | Auth verification |

### Database
| Tool | Purpose |
|------|---------|
| PostgreSQL | Main structured database |
| Neon | Serverless PostgreSQL hosting |

### Firebase Services
| Service | Purpose |
|---------|---------|
| Firebase Auth | Login / Signup |
| Firebase Storage | Image / File storage |

---

## 🏗️ Architecture

```
React (Frontend)
      ↓
  Express API (Backend)
      ↓
  PostgreSQL via Neon (Database)

Firebase → Auth + File Storage (separate)
```

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **Employee** | Add/Edit services, manage skills, mark learning interests |
| **Admin** | Full control: Add, Edit, Delete + data management + reports |

---

## 🗺️ Route Map

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | Dashboard | All Employees |
| `/profile` | My Profile | All Employees |
| `/services` | Services List | All Employees |
| `/services/:id` | Service Detail | All Employees |
| `/employees` | Employee Directory | All Employees |
| `/learning` | Want to Learn | All Employees |
| `/resources` | Resources / Lectures | All Employees |
| `/admin` | Admin Dashboard | Admin Only |

---

## 🚦 Development Phases

- [x] **Phase 0** — Project setup, folder structure, App.jsx routing
- [ ] **Phase 1** — Auth (Login, Register) + Dashboard + core layout (Navbar, Sidebar, ProtectedRoute)
- [ ] **Phase 2** — Services, ServiceDetail, Employee Directory
- [ ] **Phase 3** — Learning module + Resources
- [ ] **Phase 4** — Admin Dashboard + controls
- [ ] **Phase 5** — Backend API (Express + PostgreSQL)
- [ ] **Phase 6** — Connect Frontend ↔ Backend
- [ ] **Phase 7** — Search, filters, reports, notifications

---

## ⚙️ Setup & Run

```bash
# Clone the repo
git clone <your-repo-url>
cd ca-internal-app/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 📌 Important Rules

1. ❌ Do NOT use Firebase as the main database
2. ✅ Always access database via backend (Express API)
3. 🖼️ Store only image URLs in the database (not files)
4. 🔑 Use Firebase UID as the user identifier across all tables

---

## 📝 Current Status

> **Frontend-first approach** — completing all UI pages before connecting backend.

**Next batch to build:**
1. `AuthContext.jsx` + `useAuth.js` + `api.js` + `firebaseConfig.js`
2. `Navbar.jsx` + `Sidebar.jsx` + `ProtectedRoute.jsx`
3. Config files: `vite.config.js`, `tailwind.config.js`, `package.json`