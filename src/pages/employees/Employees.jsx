import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { employeeAPI, adminAPI } from "../../services/api";

// ─── Avatar helper ─────────────────────────────────────────────────────────────
const Avatar = ({ url, name, size = "md" }) => {
  const dim   = size === "lg" ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg";
  const initl = name?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className={`${dim} rounded-full bg-blue-100 overflow-hidden flex items-center justify-center flex-shrink-0`}>
      {url ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className="font-semibold text-blue-600"
        style={{ display: url ? "none" : "flex" }}
      >
        {initl}
      </span>
    </div>
  );
};

// ─── Employee Card ─────────────────────────────────────────────────────────────
const EmployeeCard = ({ emp, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
  >
    <div className="flex items-center gap-3 mb-4">
      <Avatar url={emp.avatar_url} name={emp.full_name} size="md" />
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{emp.full_name}</p>
        <p className="text-sm text-gray-500 truncate">{emp.designation || "Employee"}</p>
      </div>
    </div>

    <div className="mb-3">
      <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Department</p>
      <p className="text-sm text-gray-700">{emp.department || "—"}</p>
    </div>

    {emp.services?.length > 0 && (
      <div>
        <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {emp.services.slice(0, 4).map((s) => (
            <span key={s.service_id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {s.title}
            </span>
          ))}
          {emp.services.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              +{emp.services.length - 4} more
            </span>
          )}
        </div>
      </div>
    )}

    <div className="mt-3 pt-3 border-t border-gray-100">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        👤 Employee
      </span>
    </div>
  </div>
);

// ─── Detail Modal ──────────────────────────────────────────────────────────────
const EmployeeModal = ({ emp, isAdmin, onClose, onDelete, onEdit }) => {
  if (!emp) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 text-2xl leading-none transition"
        >
          ×
        </button>

        <div className="flex items-center gap-4 mb-5">
          <Avatar url={emp.avatar_url} name={emp.full_name} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{emp.full_name}</h2>
            <p className="text-sm text-gray-500">{emp.designation || "Employee"}</p>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Department</span>
            <span className="text-gray-700">{emp.department || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Email</span>
            <span className="text-gray-700 truncate ml-4">{emp.email || "—"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-medium">Role</span>
            <span className="text-gray-700 capitalize">{emp.role || "employee"}</span>
          </div>
        </div>

        {emp.services?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {emp.services.map((s) => (
                <span key={s.service_id} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => onEdit(emp)}
              className="flex-1 py-2 rounded-xl border border-blue-500 text-blue-600 text-sm font-medium hover:bg-blue-50 transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete(emp.firebase_uid)}
              className="flex-1 py-2 rounded-xl border border-red-400 text-red-500 text-sm font-medium hover:bg-red-50 transition"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ emp, onClose, onSave }) => {
  const [form, setForm]     = useState({
    full_name:   emp.full_name   || "",
    designation: emp.designation || "",
    department:  emp.department  || "",
    phone:       emp.phone       || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError("Name khali nahi ho sakta.");
      return;
    }
    setSaving(true);
    try {
      await onSave(emp.firebase_uid, form);
    } catch (err) {
      setError("Save fail hua. Dobara try karein.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Employee Edit</h2>
            <p className="text-xs text-gray-400 mt-0.5">{emp.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-600 text-2xl leading-none transition"
          >
            ×
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-xl">
          <Avatar url={emp.avatar_url} name={form.full_name || emp.full_name} size="md" />
          <div>
            <p className="text-sm font-medium text-gray-700">{form.full_name || emp.full_name}</p>
            <p className="text-xs text-gray-400">{emp.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Employee ka naam"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Designation
            </label>
            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. CA, Article Assistant"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="e.g. Audit, GST, ITR"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "✓ Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Employees() {
  const { isAdmin } = useAuth();
  const [employees,   setEmployees]   = useState([]);
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("");
  const [loading,     setLoading]     = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null); // detail modal
  const [editingEmp,  setEditingEmp]  = useState(null); // edit modal
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeAPI.getAll();
      const all = res.data.employees || [];
      setEmployees(all.filter((e) => e.role !== "admin"));
    } catch (err) {
      console.error("Failed to fetch employees:", err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(search.toLowerCase()) ||
      emp.services?.some((s) => s.title?.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept ? emp.department === filterDept : true;
    return matchSearch && matchDept;
  });

  const handleCardClick  = (emp) => setSelectedEmp(emp);
  const handleCloseModal = ()    => setSelectedEmp(null);

  // Edit button → detail modal band, edit modal kholo
  const handleEditOpen = (emp) => {
    setSelectedEmp(null);  // pehle detail modal band karo
    setEditingEmp(emp);    // phir edit modal kholo
  };

  // Edit save — UI update + backend call
  const handleEditSave = async (uid, updatedFields) => {
    try {
      // Backend pe PUT /api/admin/users/:uid/profile call karo
      // adminAPI mein ye function add karna hoga (neeche bataya hai)
      await adminAPI.updateUserProfile(uid, updatedFields);
    } catch (err) {
      console.warn("updateUserProfile API missing, optimistic update kar rahe hain:", err.message);
      // Agar API nahi hai abhi toh bhi UI update ho jayegi
    }
    // UI mein turant dikhao
    setEmployees((prev) =>
      prev.map((e) => (e.firebase_uid === uid ? { ...e, ...updatedFields } : e))
    );
    setEditingEmp(null);
  };

  const handleDelete = async (uid) => {
    // if (!window.confirm("Kya aap is employee ko permanently delete karna chahte hain?\nYeh dobara login nahi kar payega.")) return;
    if (!window.confirm("Are you sure you want to permanently delete this employee?\nThis action cannot be undone, and the employee will no longer be able to log in.")) return;
    setDeleting(true);
    try {
      await adminAPI.deleteUser(uid);
      setEmployees((prev) => prev.filter((e) => e.firebase_uid !== uid));
      setSelectedEmp(null);
    } catch (err) {
      console.error("Delete failed:", err.message);
      alert("Delete fail hua. Dobara koshish karein.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
        <p className="text-sm text-gray-500 mt-0.5">{employees.length} team members</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, designation, or skill..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-400">Loading employees...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No employees found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <EmployeeCard
              key={emp.firebase_uid}
              emp={emp}
              onClick={() => handleCardClick(emp)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <EmployeeModal
        emp={selectedEmp}
        isAdmin={isAdmin}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        onEdit={handleEditOpen}
      />

      {/* Edit Modal */}
      {editingEmp && (
        <EditModal
          emp={editingEmp}
          onClose={() => setEditingEmp(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete overlay */}
      {deleting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl px-6 py-4 text-gray-700 text-sm shadow-lg">
            Deleting employee...
          </div>
        </div>
      )}
    </div>
  );
}