import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { resourceAPI, serviceAPI } from "../../services/api";

const isYouTube = (url) =>
  url?.includes("youtube.com") || url?.includes("youtu.be");

const getYouTubeThumbnail = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

// ✅ FIX: URL normalize — https:// already hai → as-is, nahi hai → prepend karo
// Purane DB data ke liye bhi kaam karta hai
const normalizeUrl = (url) => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;   // already has protocol
  if (trimmed.startsWith("//")) return `https:${trimmed}`; // protocol-relative
  return `https://${trimmed}`;                           // bare domain
};

const ResourceCard = ({ resource, onDelete, isAdmin }) => {
  const normalizedUrl = normalizeUrl(resource.url);
  const thumbnail = isYouTube(normalizedUrl) ? getYouTubeThumbnail(normalizedUrl) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-200 hover:shadow-sm transition">
      {thumbnail && (
        <div className="w-full h-36 bg-gray-100 overflow-hidden">
          <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{resource.title}</h3>
            {resource.service_title && (
              <span className="text-xs text-gray-400 mt-0.5 block">📋 {resource.service_title}</span>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(resource.id)}
              className="text-gray-300 hover:text-red-500 transition text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          )}
        </div>
        {resource.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{resource.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isYouTube(normalizedUrl) ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
          }`}>
            {isYouTube(normalizedUrl) ? "▶ YouTube" : "🔗 Link"}
          </span>
          {/* ✅ FIX: normalizedUrl use ho raha hai — domain prepend nahi hoga */}
          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Open →
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Resources() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", url: "", description: "", service_id: "", resource_type: "video",
  });

  useEffect(() => {
    fetchResources();
    fetchServices();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourceAPI.getAll();
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("Failed to fetch resources:", err.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceAPI.getAll();
      setServices(res.data.services || []);
    } catch {}
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setFormLoading(true);
    try {
      const res = await resourceAPI.create({
        ...form,
        // ✅ FIX: save karte waqt bhi URL normalize ho jaata hai
        url: normalizeUrl(form.url),
        service_id: form.service_id ? parseInt(form.service_id) : null,
      });
      setResources([res.data.resource, ...resources]);
      setForm({ title: "", url: "", description: "", service_id: "", resource_type: "video" });
      setShowForm(false);
    } catch (err) {
      console.error("Add resource failed:", err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await resourceAPI.delete(id);
      setResources(resources.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  const filtered = resources.filter(
    (r) =>
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.service_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Lectures, videos & learning materials</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          {showForm ? "Cancel" : "+ Add Resource"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Add New Resource</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. GST Filing Tutorial"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL *</label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=... ya youtube.com/..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                value={form.resource_type}
                onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="pdf">PDF</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Service</label>
              <select
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">None</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional short description"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={formLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
          >
            {formLoading ? "Adding..." : "Add Resource"}
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search resources..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-24 text-gray-400">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          {search ? "No resources match your search." : "No resources yet. Add one!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} onDelete={handleDelete} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}