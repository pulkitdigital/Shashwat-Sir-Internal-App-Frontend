import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI, employeeAPI, serviceAPI, resourceAPI, learningAPI } from "../../services/api";

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const QuickLink = ({ to, icon, label, desc }) => (
  <Link
    to={to}
    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition group"
  >
    <div className="text-2xl mb-3">{icon}</div>
    <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{label}</p>
    <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
  </Link>
);

export default function Dashboard() {
  const { user, dbUser, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    total_employees:      0,
    total_services:       0,
    total_learning_marks: 0,
    total_resources:      0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      if (isAdmin) {
        // ✅ Fix: getAdminStats() — api.js mein yahi naam hai
        const res = await adminAPI.getAdminStats();
        setStats(res.data.stats);
      } else {
        const [empRes, svcRes, resRes, learnRes] = await Promise.all([
          employeeAPI.getAll(),
          serviceAPI.getAll(),
          resourceAPI.getAll(),
          learningAPI.getMine(),
        ]);
        setStats({
          // total_employees:      empRes.data.employees?.length   || 0,
          total_employees: empRes.data.employees?.filter(e => e.role !== "admin")?.length || 0,
          total_services:       svcRes.data.services?.length    || 0,
          total_resources:      resRes.data.resources?.length   || 0,
          total_learning_marks: learnRes.data.learning?.length  || 0,
        });
      }
    } catch (err) {
      console.error("Stats fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstName =
    dbUser?.full_name?.split(" ")[0] ||
    user?.displayName?.split(" ")[0] ||
    "there";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening in your workspace today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Employees"     value={loading ? "—" : stats.total_employees}      icon="👥" color="bg-blue-50 text-blue-600" />
        <StatCard label="Services"      value={loading ? "—" : stats.total_services}        icon="📋" color="bg-green-50 text-green-600" />
        <StatCard label="Want to Learn" value={loading ? "—" : stats.total_learning_marks}  icon="📚" color="bg-purple-50 text-purple-600" />
        <StatCard label="Resources"     value={loading ? "—" : stats.total_resources}       icon="🎥" color="bg-orange-50 text-orange-600" />
      </div>

      {/* Quick Links */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <QuickLink to="/services"  icon="📋" label="Services"   desc="Browse all services" />
          <QuickLink to="/employees" icon="👥" label="Employees"  desc="View team directory" />
          <QuickLink to="/learning"  icon="📚" label="Learning"   desc="Mark what you want to learn" />
          <QuickLink to="/resources" icon="🎥" label="Resources"  desc="Lectures & videos" />
          <QuickLink to="/profile"   icon="👤" label="My Profile" desc="Update your skills" />
          {isAdmin && (
            <QuickLink to="/admin" icon="⚙️" label="Admin Panel" desc="Manage everything" />
          )}
        </div>
      </div>

      {/* Role Badge */}
      <div className="mt-4">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          isAdmin ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
        }`}>
          {isAdmin ? "🔑 Admin" : "👤 Employee"} — {user?.email}
        </span>
      </div>
    </div>
  );
}