import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { employeeAPI, learningAPI } from "../../services/api";
import { Search, Star, BookOpen, Users } from "lucide-react";

const Skills = () => {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  const [employees,   setEmployees]   = useState([]);
  const [allLearning, setAllLearning] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (dbUser !== undefined) fetchData();
  }, [dbUser]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const isAdmin = dbUser?.role === "admin";
      const myUid   = user?.uid;

      const [empRes, learnRes] = await Promise.all([
        employeeAPI.getAll(),
        // ✅ Correct names from api.js:
        //   admin   → learningAPI.getAll()   → GET /learning/all  (all users, has firebase_uid + service_title)
        //   employee→ learningAPI.getMine()  → GET /learning      (own only, has title, NO firebase_uid)
        isAdmin ? learningAPI.getAll() : learningAPI.getMine(),
      ]);

      setEmployees(empRes.data.employees || []);

      const rawLearning =
        learnRes.data.learning ||
        learnRes.data.interests ||
        [];

      // Normalize field names across both endpoints:
      // - /learning/all  → firebase_uid ✅, service_title ⚠️ (no `title`)
      // - /learning      → no firebase_uid ⚠️, title ✅
      const normalized = rawLearning.map((item) => ({
        ...item,
        firebase_uid: item.firebase_uid ?? myUid,          // inject own uid for employee rows
        title:        item.title ?? item.service_title ?? "Unknown",
      }));

      setAllLearning(normalized);
    } catch (err) {
      console.error("Skills fetchData error:", err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // Group by firebase_uid so we can look up any employee's interests
  const learningByUid = allLearning.reduce((acc, item) => {
    const uid = item.firebase_uid;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(item);
    return acc;
  }, {});

  const myUid = user?.uid;

  const meEmployee = employees.find((e) => e.firebase_uid === myUid);

  const otherEmployees = employees
    .filter((e) => e.firebase_uid !== myUid)
    .filter((e) =>
      e.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

  // ── Chip ──────────────────────────────────────────────────────────────────
  const Chip = ({ label, color }) => (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${color}`}>
      {label}
    </span>
  );

  // ── Employee Card ──────────────────────────────────────────────────────────
  const EmployeeCard = ({ emp, isMe = false }) => {
    const empLearning = learningByUid[emp.firebase_uid] || [];

    // Deduplicate known skills
    const uniqueServices = (emp.services || []).filter(
      (svc, idx, arr) =>
        arr.findIndex((s) => s.service_id === svc.service_id) === idx
    );

    return (
      <div
        className={`bg-white rounded-2xl p-4 sm:p-5 transition-colors ${
          isMe
            ? "border-2 border-blue-200 shadow-sm"
            : "border border-gray-100 hover:border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
            {emp.avatar_url ? (
              <img src={emp.avatar_url} alt={emp.full_name} className="w-full h-full object-cover" />
            ) : (
              emp.full_name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900 truncate">{emp.full_name}</p>
              {isMe && (
                <span className="text-xs bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full shrink-0">
                  You
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {emp.designation || "—"}{emp.department ? ` · ${emp.department}` : ""}
            </p>
          </div>
          {isMe && (
            <button
              onClick={() => navigate("/profile")}
              className="text-xs text-blue-600 hover:underline shrink-0"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Skills — stacked on mobile, side-by-side on sm+ */}
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-5">

          {/* Known Skills */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Star size={13} className="text-blue-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Known Skills</p>
              <span className="ml-auto text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                {uniqueServices.length}
              </span>
            </div>
            {uniqueServices.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {uniqueServices.map((skill) => (
                  <Chip key={skill.service_id} label={skill.title} color="bg-blue-50 text-blue-700 border-blue-100" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No skills added</p>
            )}
          </div>

          {/* Divider — horizontal on mobile, vertical on sm+ */}
          <div className="sm:hidden h-px bg-gray-100 w-full" />

          {/* Want to Learn */}
          <div className="sm:relative sm:pl-5">
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-px bg-gray-100" />
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen size={13} className="text-purple-500" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Want to Learn</p>
              <span className="ml-auto text-xs bg-purple-50 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
                {empLearning.length}
              </span>
            </div>
            {empLearning.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {empLearning.map((item) => (
                  <Chip key={item.service_id} label={item.title} color="bg-purple-50 text-purple-700 border-purple-100" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Nothing added</p>
            )}
          </div>

        </div>
      </div>
    );
  };

  // ── Page ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={fetchData}
          className="text-xs text-blue-600 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-0">

      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Skills Directory</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Known skills and learning interests</p>
      </div>

      {/* My card */}
      {meEmployee && (
        <div className="mb-5 sm:mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Your Profile</p>
          <EmployeeCard emp={meEmployee} isMe={true} />
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Other employees */}
      {otherEmployees.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium text-sm">
            {searchQuery ? "No employee found" : "No other employees yet"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            All Employees ({otherEmployees.length})
          </p>
          <div className="space-y-4">
            {otherEmployees.map((emp) => (
              <EmployeeCard key={emp.firebase_uid} emp={emp} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Skills;