import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { serviceAPI, employeeAPI, learningAPI } from "../../services/api";
import ResourceForm from "../../components/ResourceForm";

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [service, setService]               = useState(null);
  const [employees, setEmployees]           = useState([]);
  const [resources, setResources]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [editing, setEditing]               = useState(false);
  const [editForm, setEditForm]             = useState({ title: "", category: "", description: "" });
  const [knowsService, setKnowsService]     = useState(false);
  const [wantToLearn, setWantToLearn]       = useState(false);
  const [actionLoading, setActionLoading]   = useState(false);
  const [updateError, setUpdateError]       = useState("");
  const [showResourceForm, setShowResourceForm] = useState(false); // ✅ NEW

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  const fetchServiceDetail = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getById(id);
      const { service, employees, resources } = res.data;

      setService(service);
      setEmployees(employees || []);
      setResources(resources || []);

      const knows = employees?.some((e) => e.firebase_uid === user?.uid);
      setKnowsService(knows);

      setEditForm({
        title:       service.title,
        category:    service.category || "",
        description: service.description || "",
      });
    } catch (err) {
      console.error("Service not found:", err.message);
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  // Sirf creator hi edit kar sakta hai
  const isOwner = service?.created_by === user?.uid;

  // ─── Update Service ──────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setUpdateError("");
    try {
      const res = await serviceAPI.update(id, editForm);
      setService(res.data.service);
      setEditing(false);
    } catch (err) {
      if (err.response?.status === 403) {
        setUpdateError("Aap sirf apni service edit kar sakte hain.");
      } else {
        setUpdateError("Update fail hua. Dobara try karein.");
      }
    }
  };

  // ─── Delete Service (Admin only) ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Delete this service permanently?")) return;
    try {
      await serviceAPI.delete(id);
      navigate("/services");
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  // ─── Toggle "I Know This" ────────────────────────────────────────────────────
  const toggleKnows = async () => {
    setActionLoading(true);
    try {
      if (knowsService) {
        await employeeAPI.removeSkill(id);
        setEmployees(employees.filter((e) => e.firebase_uid !== user?.uid));
      } else {
        await employeeAPI.addSkill({ service_id: parseInt(id), proficiency: "beginner" });
        const res = await serviceAPI.getById(id);
        setEmployees(res.data.employees || []);
      }
      setKnowsService(!knowsService);
    } catch (err) {
      console.error("Toggle knows failed:", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Toggle "Want to Learn" ──────────────────────────────────────────────────
  const toggleWantToLearn = async () => {
    setActionLoading(true);
    try {
      if (wantToLearn) {
        await learningAPI.remove(id);
      } else {
        await learningAPI.add({ service_id: parseInt(id) });
      }
      setWantToLearn(!wantToLearn);
    } catch (err) {
      console.error("Toggle learning failed:", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Resource icon helper ────────────────────────────────────────────────────
  const resourceIcon = (type) => {
    if (type === "video")   return "🎥";
    if (type === "pdf")     return "📄";
    if (type === "article") return "📝";
    return "🔗";
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-6 text-center text-gray-400 py-24">Loading...</div>
  );

  if (!service) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate("/services")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1 transition"
      >
        ← Back to Services
      </button>

      {/* Service Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        {editing ? (
          // ─── Edit Form ─────────────────────────────────────────────────────
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>

            {updateError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{updateError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => { setEditing(false); setUpdateError(""); }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // ─── View Mode ─────────────────────────────────────────────────────
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-3 py-0.5 bg-gray-100 text-gray-500 rounded-full text-sm">
                    {service.category || "General"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Added by{" "}
                    <span className="font-medium text-gray-600">
                      {isOwner ? "You" : service.created_by_name || "Unknown"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Edit button — sirf owner ko dikhega */}
                {isOwner && (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                  >
                    ✏️ Edit
                  </button>
                )}
                {/* Delete button — sirf admin ko dikhega */}
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition"
                  >
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">{service.description}</p>

            {/* My Status Buttons */}
            <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
              <button
                onClick={toggleKnows}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  knowsService
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ✅ {knowsService ? "I Know This ✓" : "Mark as Known"}
              </button>
              <button
                onClick={toggleWantToLearn}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  wantToLearn
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📚 {wantToLearn ? "Want to Learn ✓" : "Want to Learn"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Employees & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Who Knows This */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            👥 Employees who know this ({employees.length})
          </h2>
          {employees.length === 0 ? (
            <p className="text-sm text-gray-400">No employees listed yet.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((emp) => (
                <li key={emp.firebase_uid} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600 flex-shrink-0">
                    {emp.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {emp.full_name}
                      {emp.firebase_uid === user?.uid && (
                        <span className="ml-1.5 text-xs text-blue-500">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {emp.designation || "—"} · {emp.proficiency}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ─── Resources ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          {/* Resources Header with + Add toggle */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              📎 Resources ({resources.length})
            </h2>
            <button
              onClick={() => setShowResourceForm(!showResourceForm)}
              className="text-xs text-blue-600 font-medium hover:underline transition"
            >
              {showResourceForm ? "Cancel" : "+ Add"}
            </button>
          </div>

          {/* ✅ Inline Resource Form — serviceId fixed hai */}
          {showResourceForm && (
            <div className="mb-4">
              <ResourceForm
                serviceId={parseInt(id)}
                onAdd={(newResource) => {
                  setResources([...resources, newResource]);
                  setShowResourceForm(false);
                }}
                onCancel={() => setShowResourceForm(false)}
              />
            </div>
          )}

          {/* Resource List */}
          {resources.length === 0 ? (
            <p className="text-sm text-gray-400">No resources added yet.</p>
          ) : (
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <span>{resourceIcon(r.resource_type)}</span>
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}