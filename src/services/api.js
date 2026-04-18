import axios from "axios";
import { auth } from "../utils/firebaseConfig";

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Automatically attaches Firebase ID Token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.warn("Unauthorized — redirecting to login...");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.warn("Access denied. Admin only.");
    }

    if (status === 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// API Methods
// ══════════════════════════════════════════════════════════════════════════════

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Call after Firebase signup to save user into PostgreSQL
export const authAPI = {
  register : (data) => api.post("/auth/register", data), // { firebase_uid, email, full_name, designation, department, phone }
  getMe    : ()     => api.get("/auth/me"),
};

// ─── User / Profile ───────────────────────────────────────────────────────────
export const userAPI = {
  getProfile    : ()     => api.get("/users/profile"),
  updateProfile : (data) => api.put("/users/profile", data), // { full_name, designation, department, phone, avatar_url }
};

// ─── Services ─────────────────────────────────────────────────────────────────
export const serviceAPI = {
  getAll  : ()           => api.get("/services"),
  getById : (id)         => api.get(`/services/${id}`),
  create  : (data)       => api.post("/services", data),       // { title, description, category }
  update  : (id, data)   => api.put(`/services/${id}`, data),
  delete  : (id)         => api.delete(`/services/${id}`),     // 🔑 Admin only
};

// ─── Employees ────────────────────────────────────────────────────────────────
export const employeeAPI = {
  getAll        : ()           => api.get("/employees"),
  getByUid      : (uid)        => api.get(`/employees/${uid}`),

  // Skills — what the employee KNOWS
  addSkill      : (data)       => api.post("/employees/services", data),         // { service_id, proficiency }
  removeSkill   : (serviceId)  => api.delete(`/employees/services/${serviceId}`),
};

// ─── Learning (Want to Learn) ─────────────────────────────────────────────────
export const learningAPI = {
  getMine       : ()                  => api.get("/learning"),
  getAll        : ()                  => api.get("/learning/all"),                // 🔑 Admin only
  add           : (data)              => api.post("/learning", data),              // { service_id, status }
  updateStatus  : (serviceId, data)   => api.put(`/learning/${serviceId}`, data), // { status: "in_progress" | "completed" }
  remove        : (serviceId)         => api.delete(`/learning/${serviceId}`),
};

// ─── Resources ────────────────────────────────────────────────────────────────
export const resourceAPI = {
  getAll  : (serviceId)  => api.get("/resources", {
    params: serviceId ? { service_id: serviceId } : {},
  }),
  create  : (data)       => api.post("/resources", data),     // { title, description, url, resource_type, service_id }
  delete  : (id)         => api.delete(`/resources/${id}`),   // 🔑 Admin only
};

// // ─── Admin ────────────────────────────────────────────────────────────────────
// export const adminAPI = {
//   getStats      : ()            => api.get("/admin/stats"),
//   getUsers      : ()            => api.get("/admin/users"),
//   updateRole    : (uid, role)   => api.put(`/admin/users/${uid}/role`, { role }), // role: "employee" | "admin"
//   deleteUser    : (uid)         => api.delete(`/admin/users/${uid}`),
// };

export const adminAPI = {
  getAdminStats:     ()           => api.get('/admin/stats'),
  getAdminUsers:     ()           => api.get('/admin/users'),
  updateUserRole:    (uid, role)  => api.put(`/admin/users/${uid}/role`, { role }),
  updateUserProfile: (uid, data)  => api.put(`/admin/users/${uid}/profile`, data),  // ← YE ADD KARO
  deleteUser:        (uid)        => api.delete(`/admin/users/${uid}`),
};

export default api;