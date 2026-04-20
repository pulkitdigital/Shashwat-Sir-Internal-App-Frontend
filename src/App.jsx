import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Layout Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Main Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Services from "./pages/services/Services";
import ServiceDetail from "./pages/services/ServiceDetail";
import Employees from "./pages/employees/Employees";
import Learning from "./pages/learning/Learning";
import Resources from "./pages/resources/Resources";
import Skills from "./pages/skills/Skills";
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  // Show loading spinner while Firebase auth state is resolving
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ─── Public Routes ─── */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />

        {/* ─── Protected Routes (All Employees) ─── */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />

          <Route
            path="/profile"
            element={
              <AppLayout>
                <Profile />
              </AppLayout>
            }
          />

          <Route
            path="/services"
            element={
              <AppLayout>
                <Services />
              </AppLayout>
            }
          />

          <Route
            path="/services/:id"
            element={
              <AppLayout>
                <ServiceDetail />
              </AppLayout>
            }
          />

          <Route
            path="/employees"
            element={
              <AppLayout>
                <Employees />
              </AppLayout>
            }
          />

          <Route
            path="/learning"
            element={
              <AppLayout>
                <Learning />
              </AppLayout>
            }
          />

          <Route
            path="/resources"
            element={
              <AppLayout>
                <Resources />
              </AppLayout>
            }
          />

          <Route
            path="/skills"
            element={
              <AppLayout>
                <Skills />
              </AppLayout>
            }
          />
        </Route>

        {/* ─── Admin Only Routes ─── */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route
            path="/admin"
            element={
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            }
          />
        </Route>

        {/* ─── Default Redirect ─── */}
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />

        {/* ─── 404 Fallback ─── */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-200">404</h1>
                <p className="text-gray-500 mt-2 text-lg">Page not found</p>
                <a
                  href="/dashboard"
                  className="mt-4 inline-block text-blue-600 hover:underline text-sm font-medium"
                >
                  ← Back to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
