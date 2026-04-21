// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { adminAPI } from "../../services/api";

// // ─── Confirmation Modal ───────────────────────────────────────────────────────
// const ConfirmModal = ({ message, onConfirm, onCancel }) => (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//     <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
//       <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm Action</h3>
//       <p className="text-sm text-gray-500 mb-6">{message}</p>
//       <div className="flex gap-3 justify-end">
//         <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
//         <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Confirm</button>
//       </div>
//     </div>
//   </div>
// );

// // ─── Stat Card ────────────────────────────────────────────────────────────────
// const StatCard = ({ label, value, icon, color, sub }) => (
//   <div className={`rounded-2xl border p-5 ${color}`}>
//     <span className="text-2xl">{icon}</span>
//     <p className="text-3xl font-bold text-gray-900 mt-3">{value ?? "—"}</p>
//     <p className="text-sm font-medium text-gray-700 mt-0.5">{label}</p>
//     {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
//   </div>
// );

// // ─── Section Wrapper ──────────────────────────────────────────────────────────
// const Section = ({ title, children }) => (
//   <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//     <div className="px-6 py-4 border-b border-gray-100">
//       <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
//     </div>
//     <div className="p-6">{children}</div>
//   </div>
// );

// // ─── User Row ─────────────────────────────────────────────────────────────────
// const UserRow = ({ u, onRoleChange, onDelete, badgeColor }) => (
//   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
//     <div className="flex items-center gap-3">
//       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
//         {u.full_name?.charAt(0)}
//       </div>
//       <div>
//         <div className="flex items-center gap-2">
//           <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
//           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>{u.role}</span>
//         </div>
//         <p className="text-xs text-gray-400">{u.email} · {u.designation || "—"}</p>
//       </div>
//     </div>
//     <div className="flex items-center gap-2">
//       <select
//         value={u.role}
//         onChange={(e) => onRoleChange(u.firebase_uid, e.target.value, u.full_name)}
//         className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white focus:outline-none"
//       >
//         <option value="employee">Employee</option>
//         <option value="admin">Admin</option>
//       </select>
//       <button
//         onClick={() => onDelete(u.firebase_uid, u.full_name)}
//         className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition"
//       >
//         Remove
//       </button>
//     </div>
//   </div>
// );

// // ─── Main Component ───────────────────────────────────────────────────────────
// export default function AdminDashboard() {
//   const { isAdmin } = useAuth();
//   const navigate    = useNavigate();

//   const [stats,   setStats]   = useState(null);
//   const [users,   setUsers]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modal,   setModal]   = useState(null);

//   useEffect(() => {
//     if (!isAdmin) { navigate("/dashboard"); return; }
//     fetchAdminData();
//   }, [isAdmin]);

//   const fetchAdminData = async () => {
//     setLoading(true);
//     try {
//       const [statsRes, usersRes] = await Promise.all([
//         adminAPI.getAdminStats(),
//         adminAPI.getAdminUsers(),
//       ]);
//       const statsData = statsRes.data?.stats || statsRes.data || {};
//       setStats(statsData);
//       setUsers(usersRes.data.users || []);
//     } catch (err) {
//       console.error("Admin data fetch failed:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = (uid, name) => {
//     setModal({
//       message: `""Do you want to permanently remove \"${name}\"?"`,
//       onConfirm: async () => {
//         setModal(null);
//         try {
//           await adminAPI.deleteUser(uid);
//           setUsers((prev) => prev.filter((u) => u.firebase_uid !== uid));
//         } catch (err) { console.error("Delete user failed:", err.message); }
//       },
//     });
//   };

//   const handleRoleChange = (uid, newRole, name) => {
//     const msg = newRole === "admin"
//       ? `"Do you want to make \"${name}\" an Admin? They will get full admin access."`
//       : `"Do you want to change \"${name}\" from Admin to Employee?"`;
//     setModal({
//       message: msg,
//       onConfirm: async () => {
//         setModal(null);
//         try {
//           await adminAPI.updateUserRole(uid, newRole);
//           setUsers((prev) => prev.map((u) => u.firebase_uid === uid ? { ...u, role: newRole } : u));
//         } catch (err) { console.error("Role update failed:", err.message); }
//       },
//     });
//   };

//   // ── Deduplicate top_wanted by title ──
//   const uniqueTopWanted = stats?.top_wanted_services
//     ? Object.values(
//         stats.top_wanted_services.reduce((acc, s) => {
//           if (!acc[s.title]) acc[s.title] = { ...s, interest_count: Number(s.interest_count) };
//           else acc[s.title].interest_count += Number(s.interest_count);
//           return acc;
//         }, {})
//       ).sort((a, b) => b.interest_count - a.interest_count)
//     : [];

//   // ── Service counts — deduplicate by title, merge total_knows ──
//   const allServiceCounts = stats?.service_expert_counts
//     ? Object.values(
//         stats.service_expert_counts.reduce((acc, s) => {
//           const key = s.title?.trim().toLowerCase();
//           if (!acc[key]) {
//             acc[key] = { title: s.title, total_knows: Number(s.total_knows) || 0 };
//           } else {
//             acc[key].total_knows += Number(s.total_knows) || 0;
//           }
//           return acc;
//         }, {})
//       ).sort((a, b) => b.total_knows - a.total_knows)
//     : [];

//   const admins    = users.filter((u) => u.role === "admin");
//   const employees = users.filter((u) => u.role === "employee");

//   if (loading) return (
//     <div className="p-6 text-center py-24 text-gray-400">Loading admin panel...</div>
//   );

//   return (
//     <div className="p-6 max-w-6xl mx-auto">

//       {modal && (
//         <ConfirmModal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />
//       )}

//       {/* Header */}
//       <div className="mb-8">
//         <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">🔑 Admin Panel</span>
//         <h1 className="text-2xl font-bold text-gray-900 mt-2">Admin Dashboard</h1>
//         <p className="text-sm text-gray-500 mt-0.5">Manage your CA firm workspace</p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard label="Total Employees"   value={stats?.total_employees}     icon="👥" color="bg-blue-50 border-blue-100" />
//         <StatCard label="Total Services"    value={stats?.total_services}       icon="📋" color="bg-green-50 border-green-100" />
//         <StatCard label="Learning Requests" value={stats?.total_learning_marks} icon="📚" color="bg-purple-50 border-purple-100" sub="Want to Learn marked" />
//         <StatCard label="Resources"         value={stats?.total_resources}      icon="🎥" color="bg-orange-50 border-orange-100" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

//         {/* ── Service Coverage ── */}
//         <Section title={`📊 Service Coverage (${allServiceCounts.length})`}>
//           {allServiceCounts.length === 0 ? (
//             <p className="text-sm text-gray-400">No services found.</p>
//           ) : (
//             <div className="space-y-2">
//               {allServiceCounts.map((s, i) => {
//                 const total = s.total_knows || 0;
//                 return (
//                   <div
//                     key={i}
//                     className="flex items-center justify-between p-3 rounded-xl border bg-gray-50 border-gray-100"
//                   >
//                     <p className="text-sm font-medium text-gray-800">{s.title}</p>
//                     <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
//                       total > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
//                     }`}>
//                       {total} {total === 1 ? "employee" : "employees"}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </Section>

//         {/* ── Most Wanted to Learn ── */}
//         <Section title="🔥 Most Wanted to Learn">
//           {!uniqueTopWanted.length ? (
//             <p className="text-sm text-gray-400">No learning interests marked yet.</p>
//           ) : (
//             <div className="space-y-3">
//               {uniqueTopWanted.map((s, i) => (
//                 <div key={i} className="flex items-center justify-between">
//                   <p className="text-sm font-medium text-gray-800">{s.title}</p>
//                   <span className="text-sm font-semibold text-purple-600">{s.interest_count} interested</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </Section>
//       </div>

//       {/* Manage Admins */}
//       <div className="mb-4">
//         <Section title={`🔑 Manage Admins (${admins.length})`}>
//           <div className="space-y-3">
//             {admins.length === 0 ? (
//               <p className="text-sm text-gray-400">No admins found.</p>
//             ) : (
//               admins.map((u) => (
//                 <UserRow key={u.firebase_uid} u={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} badgeColor="bg-blue-100 text-blue-700" />
//               ))
//             )}
//           </div>
//         </Section>
//       </div>

//       {/* Manage Employees */}
//       <div className="mb-4">
//         <Section title={`👥 Manage Employees (${employees.length})`}>
//           <div className="space-y-3">
//             {employees.length === 0 ? (
//               <p className="text-sm text-gray-400">No employees found.</p>
//             ) : (
//               employees.map((u) => (
//                 <UserRow key={u.firebase_uid} u={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} badgeColor="bg-gray-100 text-gray-600" />
//               ))
//             )}
//           </div>
//         </Section>
//       </div>

//       {/* Quick Actions */}
//       <Section title="⚡ Quick Actions">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//           {[
//             { label: "Manage Employees", path: "/employees", icon: "👥" },
//             { label: "Manage Services",  path: "/services",  icon: "📋" },
//             { label: "Manage Resources", path: "/resources", icon: "🎥" },
//             { label: "View Learning",    path: "/learning",  icon: "📚" },
//           ].map((action) => (
//             <button
//               key={action.path}
//               onClick={() => navigate(action.path)}
//               className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-xl transition group"
//             >
//               <span className="text-2xl">{action.icon}</span>
//               <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center transition">{action.label}</span>
//             </button>
//           ))}
//         </div>
//       </Section>

//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminAPI } from "../../services/api";

// ─── Confirmation Modal ───────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
      <h3 className="text-base font-semibold text-gray-900 mb-2">Confirm Action</h3>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Confirm</button>
      </div>
    </div>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div className={`rounded-2xl border p-4 md:p-5 ${color}`}>
    <span className="text-xl md:text-2xl">{icon}</span>
    <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 md:mt-3">{value ?? "—"}</p>
    <p className="text-xs md:text-sm font-medium text-gray-700 mt-0.5 leading-snug">{label}</p>
    {sub && <p className="text-[10px] md:text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div className="px-4 md:px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
    </div>
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

// ─── User Row ─────────────────────────────────────────────────────────────────
const UserRow = ({ u, onRoleChange, onDelete, badgeColor }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
    {/* User Info */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
        {u.full_name?.charAt(0)}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-800">{u.full_name}</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>{u.role}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{u.email} · {u.designation || "—"}</p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2 self-end sm:self-auto">
      <select
        value={u.role}
        onChange={(e) => onRoleChange(u.firebase_uid, e.target.value, u.full_name)}
        className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none"
      >
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={() => onDelete(u.firebase_uid, u.full_name)}
        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition"
      >
        Remove
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    fetchAdminData();
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getAdminStats(),
        adminAPI.getAdminUsers(),
      ]);
      const statsData = statsRes.data?.stats || statsRes.data || {};
      setStats(statsData);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error("Admin data fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (uid, name) => {
    setModal({
      message: `Do you want to permanently remove "${name}"?`,
      onConfirm: async () => {
        setModal(null);
        try {
          await adminAPI.deleteUser(uid);
          setUsers((prev) => prev.filter((u) => u.firebase_uid !== uid));
        } catch (err) { console.error("Delete user failed:", err.message); }
      },
    });
  };

  const handleRoleChange = (uid, newRole, name) => {
    const msg = newRole === "admin"
      ? `Do you want to make "${name}" an Admin? They will get full admin access.`
      : `Do you want to change "${name}" from Admin to Employee?`;
    setModal({
      message: msg,
      onConfirm: async () => {
        setModal(null);
        try {
          await adminAPI.updateUserRole(uid, newRole);
          setUsers((prev) => prev.map((u) => u.firebase_uid === uid ? { ...u, role: newRole } : u));
        } catch (err) { console.error("Role update failed:", err.message); }
      },
    });
  };

  // ── Deduplicate top_wanted by title ──
  const uniqueTopWanted = stats?.top_wanted_services
    ? Object.values(
        stats.top_wanted_services.reduce((acc, s) => {
          if (!acc[s.title]) acc[s.title] = { ...s, interest_count: Number(s.interest_count) };
          else acc[s.title].interest_count += Number(s.interest_count);
          return acc;
        }, {})
      ).sort((a, b) => b.interest_count - a.interest_count)
    : [];

  // ── Service counts — deduplicate by title ──
  const allServiceCounts = stats?.service_expert_counts
    ? Object.values(
        stats.service_expert_counts.reduce((acc, s) => {
          const key = s.title?.trim().toLowerCase();
          if (!acc[key]) {
            acc[key] = { title: s.title, total_knows: Number(s.total_knows) || 0 };
          } else {
            acc[key].total_knows += Number(s.total_knows) || 0;
          }
          return acc;
        }, {})
      ).sort((a, b) => b.total_knows - a.total_knows)
    : [];

  const admins    = users.filter((u) => u.role === "admin");
  const employees = users.filter((u) => u.role === "employee");

  if (loading) return (
    <div className="p-6 text-center py-24 text-gray-400">Loading admin panel...</div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">

      {modal && (
        <ConfirmModal message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />
      )}

      {/* Header */}
      <div className="mb-6 md:mb-8">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">🔑 Admin Panel</span>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your CA firm workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <StatCard label="Total Employees"   value={stats?.total_employees}     icon="👥" color="bg-blue-50 border-blue-100" />
        <StatCard label="Total Services"    value={stats?.total_services}       icon="📋" color="bg-green-50 border-green-100" />
        <StatCard label="Learning Requests" value={stats?.total_learning_marks} icon="📚" color="bg-purple-50 border-purple-100" sub="Want to Learn marked" />
        <StatCard label="Resources"         value={stats?.total_resources}      icon="🎥" color="bg-orange-50 border-orange-100" />
      </div>

      {/* Service Coverage + Most Wanted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <Section title={`📊 Service Coverage (${allServiceCounts.length})`}>
          {allServiceCounts.length === 0 ? (
            <p className="text-sm text-gray-400">No services found.</p>
          ) : (
            <div className="space-y-2">
              {allServiceCounts.map((s, i) => {
                const total = s.total_knows || 0;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border bg-gray-50 border-gray-100"
                  >
                    <p className="text-sm font-medium text-gray-800 mr-2">{s.title}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                      total > 0 ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-600"
                    }`}>
                      {total} {total === 1 ? "employee" : "employees"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="🔥 Most Wanted to Learn">
          {!uniqueTopWanted.length ? (
            <p className="text-sm text-gray-400">No learning interests marked yet.</p>
          ) : (
            <div className="space-y-3">
              {uniqueTopWanted.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-gray-800">{s.title}</p>
                  <span className="text-sm font-semibold text-purple-600 flex-shrink-0">{s.interest_count} interested</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Manage Admins */}
      <div className="mb-4">
        <Section title={`🔑 Manage Admins (${admins.length})`}>
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-sm text-gray-400">No admins found.</p>
            ) : (
              admins.map((u) => (
                <UserRow key={u.firebase_uid} u={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} badgeColor="bg-blue-100 text-blue-700" />
              ))
            )}
          </div>
        </Section>
      </div>

      {/* Manage Employees */}
      <div className="mb-4">
        <Section title={`👥 Manage Employees (${employees.length})`}>
          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-sm text-gray-400">No employees found.</p>
            ) : (
              employees.map((u) => (
                <UserRow key={u.firebase_uid} u={u} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} badgeColor="bg-gray-100 text-gray-600" />
              ))
            )}
          </div>
        </Section>
      </div>

      {/* Quick Actions */}
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
              className="flex flex-col items-center gap-2 p-3 md:p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-xl transition group"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600 text-center transition">{action.label}</span>
            </button>
          ))}
        </div>
      </Section>

    </div>
  );
}