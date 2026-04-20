import { useState } from "react";
import { resourceAPI } from "../services/api";

const normalizeUrl = (url) => {
  if (!url) return "#";
  const t = url.trim();
  if (!t) return "#";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
};

// ─── ResourceForm ──────────────────────────────────────────────────────────────
// Props:
//   serviceId  — number | null
//     • number  → service fix hai, dropdown nahi dikhega
//     • null    → user choose kar sakta hai (Resources.jsx)
//   services   — array (sirf tab chahiye jab serviceId === null)
//   onAdd(resource) — naya resource milne par call hoga
//   onCancel()      — optional cancel button
// ──────────────────────────────────────────────────────────────────────────────
export default function ResourceForm({ serviceId = null, services = [], onAdd, onCancel }) {
  const [form, setForm] = useState({
    title:         "",
    url:           "",
    description:   "",
    resource_type: "video",
    service_id:    serviceId !== null ? serviceId : "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setError("Title aur URL dono required hain.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await resourceAPI.create({
        ...form,
        url:        normalizeUrl(form.url),
        service_id: form.service_id ? parseInt(form.service_id) : null,
      });
      onAdd(res.data.resource);
      // Reset (serviceId fixed rakho)
      setForm({
        title:         "",
        url:           "",
        description:   "",
        resource_type: "video",
        service_id:    serviceId !== null ? serviceId : "",
      });
    } catch (err) {
      setError("Resource add nahi ho saka. Dobara try karein.");
      console.error("Add resource failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Add Resource
      </h2>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. GST Filing Tutorial"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL *</label>
          <input
            type="text"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <select
            value={form.resource_type}
            onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="pdf">PDF</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Service dropdown — sirf tab dikhao jab serviceId prop fix na ho */}
        {serviceId === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Related Service
            </label>
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">None</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description — full width */}
        <div className={serviceId === null ? "md:col-span-2" : "md:col-span-2"}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional short description"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition"
        >
          {loading ? "Adding..." : "Add Resource"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}