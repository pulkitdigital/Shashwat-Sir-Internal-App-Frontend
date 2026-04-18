import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`rounded-2xl border p-5 ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value ?? "—"}</p>
    <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    fetchAdminData();
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getAdminStats(),
        adminAPI.getAdminUsers(),
      ]);
      setStats(statsRes.data.stats);

      // ✅ Sirf employees dikhao — admins filter out
      const onlyEmployees = (usersRes.data.users || []).filter(
        (u) => u.role !== "admin"
      );
      setUsers(onlyEmployees);
    } catch (err) {
      console.error("Admin data fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Remove this employee permanently?")) return;
    try {
      await adminAPI.deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.firebase_uid !== uid));
    } catch (err) {
      console.error("Delete user failed:", err.message);
    }
  };

  const handleRoleChange = async (uid, newRole) => {
    try {
      await adminAPI.updateUserRole(uid, newRole);
      // Agar employee ko admin banaya toh list se remove karo
      if (newRole === "admin") {
        setUsers((prev) => prev.filter((u) => u.firebase_uid !== uid));
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.firebase_uid === uid ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Role update failed:", err.message);
    }
  };

  if (loading) return (
    <div className="p-6 text-center py-24 text-gray-400">Loading admin panel...</div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          🔑 Admin Panel
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your CA firm workspace</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees"    value={stats?.total_employees}      icon="👥" color="bg-blue-50 border-blue-100" />
        <StatCard label="Total Services"     value={stats?.total_services}        icon="📋" color="bg-green-50 border-green-100" />
        <StatCard label="Learning Requests"  value={stats?.total_learning_marks}  icon="📚" color="bg-purple-50 border-purple-100" sub="Want to Learn marked" />
        <StatCard label="Resources"          value={stats?.total_resources}       icon="🎥" color="bg-orange-50 border-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Skill Gaps */}
        <Section title="📊 Skill Gaps — No experts yet">
          {!stats?.skill_gaps?.length ? (
            <p className="text-sm text-gray-400">No skill gaps found. Great coverage!</p>
          ) : (
            <div className="space-y-2">
              {stats.skill_gaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-medium text-gray-800">{gap.title}</p>
                  <span className="text-xs text-red-600 font-semibold">0 experts</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Top Wanted */}
        <Section title="🔥 Most Wanted to Learn">
          {!stats?.top_wanted_services?.length ? (
            <p className="text-sm text-gray-400">No learning interests marked yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.top_wanted_services.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{s.title}</p>
                  <span className="text-sm font-semibold text-purple-600">
                    {s.interest_count} interested
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* User Management — only employees */}
      <Section title={`👥 Manage Employees (${users.length})`}>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-gray-400">No employees found.</p>
          ) : (
            users.map((u) => (
              <div
                key={u.firebase_uid}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.email} · {u.designation || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.firebase_uid, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(u.firebase_uid)}
                    className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Quick Actions */}
      <div className="mt-4">
        <Section title="⚡ Quick Actions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manage Employees", path: "/employees", icon: "👥" },
              { label: "Manage Services",  path: "/services",  icon: "📋" },
              { label: "Manage Resources", path: "/resources", icon: "🎥" },
              { label: "View Learning",    path: "/learning",  icon: "📚" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-xl transition group"
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center transition">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </Section>
      </div>

    </div>
  );
}