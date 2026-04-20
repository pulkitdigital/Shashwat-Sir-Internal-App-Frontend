import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { serviceAPI, resourceAPI } from "../../services/api"; // ✅ resourceAPI import add karo
import ResourceForm from "../../components/ResourceForm"; // ✅ import

// ─── Tab Button ────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children, count }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
    }`}
  >
    {children}
    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
      active ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
    }`}>
      {count}
    </span>
  </button>
);

// ─── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onDelete, isAdmin, currentUid }) => {
  const isOwner = service.created_by === currentUid;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-200 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base">{service.title}</h3>
            {isOwner && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium">
                ✏️ You
              </span>
            )}
          </div>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
            {service.category || "General"}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{service.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400">
            {service.employee_count || 0} employees know this
          </span>
          <span className="text-xs text-gray-400">
            Added by{" "}
            <span className="font-medium text-gray-600">
              {isOwner ? "You" : service.created_by_name || "Unknown"}
            </span>
          </span>
        </div>
        <Link
          to={`/services/${service.id}`}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Services() {
  const { isAdmin, user } = useAuth();
  const [services, setServices]             = useState([]);
  const [search, setSearch]                 = useState("");
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState("all");
  const [showForm, setShowForm]             = useState(false);
  const [form, setForm]                     = useState({ title: "", category: "", description: "" });
  const [formLoading, setFormLoading]       = useState(false);
  const [error, setError]                   = useState("");

  // ✅ New: resource state
  const [pendingResources, setPendingResources] = useState([]); // staged resources
  const [showResourceForm, setShowResourceForm] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAll();
      setServices(res.data.services || []);
    } catch (err) {
      console.error("Failed to fetch services:", err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ResourceForm ka onAdd — sirf local state mein stage karo (service abhi bani nahi)
  const handleStagedResource = (resource) => {
    // resourceAPI.create nahi hoga abhi — hum sirf form data store karenge
    // ResourceForm normally API call karta hai, isliye ek alag inline mini-form banate hain
    setPendingResources((prev) => [...prev, resource]);
    setShowResourceForm(false);
  };

  const removePendingResource = (index) => {
    setPendingResources((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Save: pehle service banao, phir resources
  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setFormLoading(true);
    setError("");
    try {
      // Step 1: Service create karo
      const res = await serviceAPI.create(form);
      const newService = res.data.service;

      // Step 2: Pending resources ko us service ke saath save karo
      for (const r of pendingResources) {
        await resourceAPI.create({ ...r, service_id: newService.id });
      }

      // Step 3: Reset & update list
      setServices([newService, ...services]);
      setForm({ title: "", category: "", description: "" });
      setPendingResources([]);
      setShowForm(false);
      setShowResourceForm(false);
    } catch (err) {
      setError("Failed to add service. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await serviceAPI.delete(id);
      setServices(services.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setShowResourceForm(false);
    setPendingResources([]);
    setForm({ title: "", category: "", description: "" });
    setError("");
  };

  const myServices  = services.filter((s) => s.created_by === user?.uid);
  const allServices = services;
  const baseList    = activeTab === "mine" ? myServices : allServices;
  const filtered    = baseList.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} services available</p>
        </div>
        <button
          onClick={() => showForm ? handleCancelForm() : setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          {showForm ? "Cancel" : "+ Add Service"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")} count={allServices.length}>
          📋 All Services
        </Tab>
        <Tab active={activeTab === "mine"} onClick={() => setActiveTab("mine")} count={myServices.length}>
          ✏️ My Services
        </Tab>
      </div>

      {/* ─── Add Form ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">New Service</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
          )}

          {/* Service Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. GST Filing"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Taxation"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>

          {/* ─── Resources Section ──────────────────────────────────────────── */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                📎 Resources (optional)
              </h3>
              <button
                onClick={() => setShowResourceForm(!showResourceForm)}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                {showResourceForm ? "Cancel" : "+ Add Resource"}
              </button>
            </div>

            {/* Inline ResourceForm — service_id null kyunki abhi service bani nahi */}
            {showResourceForm && (
              <div className="mb-3">
                <InlineResourceInput
                  onAdd={handleStagedResource}
                  onCancel={() => setShowResourceForm(false)}
                />
              </div>
            )}

            {/* Staged resources list */}
            {pendingResources.length > 0 && (
              <ul className="space-y-1.5">
                {pendingResources.map((r, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-700">
                      {r.resource_type === "video" ? "🎥" : r.resource_type === "pdf" ? "📄" : r.resource_type === "article" ? "📝" : "🔗"}{" "}
                      <span className="font-medium">{r.title}</span>
                      <span className="text-gray-400 ml-1 text-xs">({r.resource_type})</span>
                    </span>
                    <button
                      onClick={() => removePendingResource(i)}
                      className="text-red-400 hover:text-red-600 text-xs ml-3"
                    >
                      ✕ Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Save Button */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={formLoading || !form.title.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
            >
              {formLoading
                ? "Saving..."
                : pendingResources.length > 0
                ? `Save Service + ${pendingResources.length} Resource${pendingResources.length > 1 ? "s" : ""}`
                : "Save Service"}
            </button>
            <button
              onClick={handleCancelForm}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name or category..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading services...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {activeTab === "mine"
            ? "You haven't added any services yet."
            : search
            ? "No services match your search."
            : "No services yet. Add one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              currentUid={user?.uid}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline Resource Input ─────────────────────────────────────────────────────
// Yeh ResourceForm.jsx use nahi karta kyunki abhi service_id exist nahi karta
// Sirf local state mein data stage karta hai, API call nahi karta
function InlineResourceInput({ onAdd, onCancel }) {
  const normalizeUrl = (url) => {
    if (!url) return "#";
    const t = url.trim();
    if (!t) return "#";
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith("//")) return `https:${t}`;
    return `https://${t}`;
  };

  const [form, setForm] = useState({
    title: "", url: "", description: "", resource_type: "video",
  });
  const [err, setErr] = useState("");

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) {
      setErr("Title aur URL dono required hain.");
      return;
    }
    onAdd({ ...form, url: normalizeUrl(form.url) });
    setForm({ title: "", url: "", description: "", resource_type: "video" });
    setErr("");
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
      {err && <p className="text-xs text-red-500">{err}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. GST Filing Tutorial"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">URL *</label>
          <input
            type="text"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={form.resource_type}
            onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="video">🎥 Video</option>
            <option value="article">📝 Article</option>
            <option value="pdf">📄 PDF</option>
            <option value="other">🔗 Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
        >
          + Stage Resource
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}