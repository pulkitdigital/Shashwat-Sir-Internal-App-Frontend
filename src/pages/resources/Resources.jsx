import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { resourceAPI, serviceAPI } from "../../services/api";
import ResourceForm from "../../components/ResourceForm";

const isYouTube = (url) =>
  url?.includes("youtube.com") || url?.includes("youtu.be");

const getYouTubeThumbnail = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const normalizeUrl = (url) => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
};

// ─── Resource Card ─────────────────────────────────────────────────────────────
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Resources() {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);

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

      {/* ✅ Shared ResourceForm — serviceId null, services list pass karo */}
      {showForm && (
        <div className="mb-6">
          <ResourceForm
            serviceId={null}
            services={services}
            onAdd={(newResource) => {
              setResources([newResource, ...resources]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
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
            <ResourceCard
              key={r.id}
              resource={r}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}