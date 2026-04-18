# 🖥️ Frontend Documentation — CA Firm Internal App

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI Library |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP Client |
| React Router v6 | 6.x | Client-side Routing |
| Firebase JS SDK | 10.x | Auth + Storage |

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── Sidebar.jsx          # Left sidebar with nav links
│   │   └── ProtectedRoute.jsx   # Auth guard for private routes
│   ├── context/
│   │   └── AuthContext.jsx      # Firebase auth state (global)
│   ├── hooks/
│   │   └── useAuth.js           # Custom hook: const { user } = useAuth()
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx        # Firebase email/password login
│   │   │   └── Register.jsx     # Firebase signup + POST /api/auth/register
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx    # Home after login
│   │   ├── profile/
│   │   │   └── Profile.jsx      # My profile + skills management
│   │   ├── services/
│   │   │   ├── Services.jsx     # List all services
│   │   │   └── ServiceDetail.jsx# Single service + employees + resources
│   │   ├── employees/
│   │   │   └── Employees.jsx    # Employee directory
│   │   ├── learning/
│   │   │   └── Learning.jsx     # My "Want to Learn" list
│   │   ├── resources/
│   │   │   └── Resources.jsx    # Lecture/video links
│   │   └── admin/
│   │       └── AdminDashboard.jsx # Admin-only panel
│   ├── services/
│   │   └── api.js               # All Axios API calls (see below)
│   ├── utils/
│   │   └── firebaseConfig.js    # Firebase SDK init
│   ├── App.jsx                  ✅ DONE — routing setup
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Environment Variables (.env)

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Route Map

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login.jsx | Public |
| `/register` | Register.jsx | Public |
| `/dashboard` | Dashboard.jsx | Employee + Admin |
| `/profile` | Profile.jsx | Employee + Admin |
| `/services` | Services.jsx | Employee + Admin |
| `/services/:id` | ServiceDetail.jsx | Employee + Admin |
| `/employees` | Employees.jsx | Employee + Admin |
| `/learning` | Learning.jsx | Employee + Admin |
| `/resources` | Resources.jsx | Employee + Admin |
| `/admin` | AdminDashboard.jsx | Admin Only |

---

## Firebase Flow

### Authentication
```
User fills Login/Register form
       ↓
Firebase Auth (signInWithEmailAndPassword / createUserWithEmailAndPassword)
       ↓
AuthContext stores user + token
       ↓
On Register: POST /api/auth/register with { firebase_uid, email, full_name }
       ↓
Redirect → /dashboard
```

### File Upload (Avatar)
```
User selects image
       ↓
Upload to Firebase Storage → get download URL
       ↓
PUT /api/users/profile with { avatar_url: downloadURL }
       ↓
Store URL in PostgreSQL (NOT the file)
```

---

## api.js — Available Functions

### Auth
```js
registerUser(data)     // POST /auth/register
getMe()                // GET  /auth/me
```

### Profile
```js
getProfile()           // GET  /users/profile
updateProfile(data)    // PUT  /users/profile
```

### Services
```js
getAllServices()        // GET  /services
getServiceById(id)      // GET  /services/:id
createService(data)     // POST /services
updateService(id, data) // PUT  /services/:id
deleteService(id)       // DELETE /services/:id  [admin]
```

### Employees
```js
getAllEmployees()              // GET  /employees
getEmployeeByUid(uid)          // GET  /employees/:uid
addEmployeeService(data)       // POST /employees/services
removeEmployeeService(svcId)   // DELETE /employees/services/:serviceId
```

### Learning
```js
getMyLearning()                      // GET  /learning
getAllLearning()                      // GET  /learning/all [admin]
addLearningInterest(data)            // POST /learning
updateLearningStatus(serviceId, data) // PUT  /learning/:serviceId
removeLearningInterest(serviceId)    // DELETE /learning/:serviceId
```

### Resources
```js
getAllResources(serviceId?)   // GET  /resources
createResource(data)          // POST /resources
deleteResource(id)            // DELETE /resources/:id [admin]
```

### Admin
```js
getAdminStats()               // GET  /admin/stats
getAdminUsers()               // GET  /admin/users
updateUserRole(uid, role)     // PUT  /admin/users/:uid/role
deleteUser(uid)               // DELETE /admin/users/:uid
```

---

## Token Handling

The Axios interceptor in `api.js` automatically attaches the Firebase token:

```js
api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser.getIdToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

No manual token management needed anywhere else.

---

## User Roles UI Logic

```js
const { user, dbUser } = useAuth();

// Check admin
if (dbUser?.role === 'admin') {
  // Show delete buttons, admin nav link, etc.
}
```

---

## Setup & Run

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```