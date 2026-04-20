import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI, employeeAPI } from "../../services/api";
import { Search, Star, Users, ArrowRight } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const Skills = () => {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();

  // ── Employee state ──────────────────────────────────────────────────────────
  const [mySkills, setMySkills] = useState([]);

  // ── Admin state ─────────────────────────────────────────────────────────────
  const [employees,   setEmployees]   = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (isAdmin) {
        const res = await employeeAPI.getAll();
        setEmployees(res.data.employees || []);
      } else {
        const res = await userAPI.getProfile();
        const services = res.data.profile?.known_services || [];
        // Deduplicate by service_id — same logic as Profile.jsx
        const deduped = Array.from(
          new Map(services.map((s) => [String(s.service_id), s])).values()
        );
        setMySkills(deduped);
      }
    } catch {
      setError("Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  // ── Admin: filter + sort alphabetically ─────────────────────────────────────
  const filteredEmployees = employees
    .filter((emp) =>
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EMPLOYEE VIEW — read-only, manage via Profile
  // ════════════════════════════════════════════════════════════════════════════
  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your registered skills</p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Skills
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Empty state */}
        {mySkills.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Star size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No skills found</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              Go to your profile to add your first skill
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Profile
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            {/* Skills list */}
            <div className="grid gap-3">
              {mySkills.map((skill) => (
                <div
                  key={skill.service_id}
                  className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:border-gray-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {skill.title?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{skill.title}</span>
                </div>
              ))}
            </div>

            {/* Summary + manage link */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Total: <strong className="text-gray-700">{mySkills.length}</strong> skills
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Add / Remove in Profile <ArrowRight size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ADMIN VIEW — all employees' skills, name-wise
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Skills Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">All employees and their skills</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            color: "text-gray-900",
          },
          {
            label: "Total Skills Logged",
            value: employees.reduce((a, e) => a + (e.services?.length || 0), 0),
            color: "text-blue-600",
          },
          {
            label: "Employees with Skills",
            value: employees.filter((e) => e.services?.length > 0).length,
            color: "text-green-600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Employee list */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No employee found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.firebase_uid}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
            >
              {/* Employee header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                  {emp.avatar_url ? (
                    <img
                      src={emp.avatar_url}
                      alt={emp.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    emp.full_name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{emp.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {emp.designation || "—"}
                    {emp.department ? ` · ${emp.department}` : ""}
                  </p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full shrink-0">
                  {emp.services?.length || 0} skills
                </span>
              </div>

              {/* Skills chips */}
              {emp.services && emp.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {emp.services.map((skill) => (
                    <span
                      key={skill.service_id}
                      className="text-xs text-gray-700 font-medium bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1"
                    >
                      {skill.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No skills added</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Skills;