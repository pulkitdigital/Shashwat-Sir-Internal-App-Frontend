// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { resourceAPI, serviceAPI } from "../../services/api";
// import ResourceForm from "../../components/ResourceForm";

// const isYouTube = (url) =>
//   url?.includes("youtube.com") || url?.includes("youtu.be");

// const getYouTubeThumbnail = (url) => {
//   const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
//   return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
// };

// const normalizeUrl = (url) => {
//   if (!url) return "#";
//   const trimmed = url.trim();
//   if (!trimmed) return "#";
//   if (/^https?:\/\//i.test(trimmed)) return trimmed;
//   if (trimmed.startsWith("//")) return `https:${trimmed}`;
//   return `https://${trimmed}`;
// };

// // ─── Resource Card ─────────────────────────────────────────────────────────────
// const ResourceCard = ({ resource, onDelete, isAdmin, currentUid }) => {
//   const normalizedUrl = normalizeUrl(resource.url);
//   const thumbnail = isYouTube(normalizedUrl) ? getYouTubeThumbnail(normalizedUrl) : null;
//   const isOwner = resource.added_by === currentUid;

//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-200 hover:shadow-sm transition">
//       {thumbnail && (
//         <div className="w-full h-36 bg-gray-100 overflow-hidden">
//           <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover" />
//         </div>
//       )}
//       <div className="p-4">
//         <div className="flex items-start justify-between gap-2 mb-2">
//           <div>
//             <h3 className="font-semibold text-gray-900 text-sm leading-snug">{resource.title}</h3>
//             {resource.service_title && (
//               <span className="text-xs text-gray-400 mt-0.5 block">📋 {resource.service_title}</span>
//             )}
//           </div>
//           {isAdmin && (
//             <button
//               onClick={() => onDelete(resource.id)}
//               className="text-gray-300 hover:text-red-500 transition text-lg leading-none flex-shrink-0"
//             >
//               ×
//             </button>
//           )}
//         </div>

//         {resource.description && (
//           <p className="text-xs text-gray-500 mb-3 line-clamp-2">{resource.description}</p>
//         )}

//         {/* ✅ Added by */}
//         <p className="text-xs text-gray-400 mb-3">
//           Added by{" "}
//           <span className="font-medium text-gray-600">
//             {isOwner ? "You" : resource.added_by_name || "Unknown"}
//           </span>
//         </p>

//         <div className="flex items-center justify-between">
//           <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
//             isYouTube(normalizedUrl) ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
//           }`}>
//             {isYouTube(normalizedUrl) ? "▶ YouTube" : "🔗 Link"}
//           </span>
//           <a
//             href={normalizedUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-xs text-blue-600 font-medium hover:underline"
//           >
//             Open →
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Page ─────────────────────────────────────────────────────────────────
// export default function Resources() {
//   const { isAdmin, user } = useAuth();
//   const [resources, setResources] = useState([]);
//   const [services,  setServices]  = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [search,    setSearch]    = useState("");
//   const [showForm,  setShowForm]  = useState(false);

//   useEffect(() => {
//     fetchResources();
//     fetchServices();
//   }, []);

//   const fetchResources = async () => {
//     setLoading(true);
//     try {
//       const res = await resourceAPI.getAll();
//       setResources(res.data.resources || []);
//     } catch (err) {
//       console.error("Failed to fetch resources:", err.message);
//       setResources([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchServices = async () => {
//     try {
//       const res = await serviceAPI.getAll();
//       setServices(res.data.services || []);
//     } catch {}
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this resource?")) return;
//     try {
//       await resourceAPI.delete(id);
//       setResources(resources.filter((r) => r.id !== id));
//     } catch (err) {
//       console.error("Delete failed:", err.message);
//     }
//   };

//   const filtered = resources.filter(
//     (r) =>
//       r.title?.toLowerCase().includes(search.toLowerCase()) ||
//       r.service_title?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
//           <p className="text-sm text-gray-500 mt-0.5">Lectures, videos & learning materials</p>
//         </div>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
//         >
//           {showForm ? "Cancel" : "+ Add Resource"}
//         </button>
//       </div>

//       {showForm && (
//         <div className="mb-6">
//           <ResourceForm
//             serviceId={null}
//             services={services}
//             onAdd={(newResource) => {
//               setResources([newResource, ...resources]);
//               setShowForm(false);
//             }}
//             onCancel={() => setShowForm(false)}
//           />
//         </div>
//       )}

//       {/* Search */}
//       <div className="mb-5">
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="🔍  Search resources..."
//           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//         />
//       </div>

//       {/* Grid */}
//       {loading ? (
//         <div className="text-center py-24 text-gray-400">Loading resources...</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-center py-24 text-gray-400">
//           {search ? "No resources match your search." : "No resources yet. Add one!"}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map((r) => (
//             <ResourceCard
//               key={r.id}
//               resource={r}
//               onDelete={handleDelete}
//               isAdmin={isAdmin}
//               currentUid={user?.uid}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }






















import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { resourceAPI, serviceAPI } from "../../services/api";
import ResourceForm from "../../components/ResourceForm";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isYouTube = (url) => url?.includes("youtube.com") || url?.includes("youtu.be");

const getYouTubeThumbnail = (url) => {
  const match = url?.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

const normalizeUrl = (url) => {
  if (!url) return "#";
  const t = url.trim();
  if (!t) return "#";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
};

const TYPE_BADGE = {
  video:   { label: "Video",   className: "bg-red-50 text-red-600"       },
  pdf:     { label: "PDF",     className: "bg-orange-50 text-orange-600" },
  article: { label: "Article", className: "bg-green-50 text-green-600"   },
  other:   { label: "Link",    className: "bg-blue-50 text-blue-600"     },
};

const OPEN_LABEL = {
  video:   "Watch Video →",
  pdf:     "Open PDF →",
  article: "Read Article →",
  other:   "Open →",
};

// ─── Resource Card ─────────────────────────────────────────────────────────────
const ResourceCard = ({ resource, onDelete, isAdmin, currentUid }) => {
  const url       = normalizeUrl(resource.url);
  const thumbnail = isYouTube(url) ? getYouTubeThumbnail(url) : null;
  const isOwner   = resource.added_by === currentUid;
  const badge     = TYPE_BADGE[resource.resource_type] || TYPE_BADGE.other;

  const dateStr = resource.created_at
    ? new Date(resource.created_at).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-200 hover:shadow-sm transition flex flex-col">

      {/* YouTube thumbnail */}
      {thumbnail && (
        <div className="w-full h-36 bg-gray-100 overflow-hidden flex-shrink-0">
          <img src={thumbnail} alt={resource.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* PDF banner */}
      {/* {resource.resource_type === "pdf" && !thumbnail && (
        <div className="w-full h-20 bg-orange-50 flex items-center justify-center flex-shrink-0">
          <span className="text-4xl">📄</span>
        </div>
      )} */}

      <div className="p-4 flex flex-col flex-1">

        {/* Title + delete */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug break-words">
              {resource.title}
            </h3>
            {resource.service_title && (
              <span className="text-xs text-gray-400 mt-0.5 block">📋 {resource.service_title}</span>
            )}
          </div>
          {isAdmin && (
            <button onClick={() => onDelete(resource.id)} title="Delete"
              className="text-gray-300 hover:text-red-500 transition text-lg leading-none flex-shrink-0 mt-0.5">
              ×
            </button>
          )}
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{resource.description}</p>
        )}

        {/* Added by + date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <span>
            Added by{" "}
            <span className="font-medium text-gray-600">
              {isOwner ? "You" : resource.added_by_name || "Unknown"}
            </span>
          </span>
          {dateStr && <><span>·</span><span>{dateStr}</span></>}
        </div>

        <div className="flex-1" />

        {/* Footer: badge + action links */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
            {badge.label}
          </span>
          <div className="flex items-center gap-3">
            {/* Article: show PDF button if attached */}
            {resource.resource_type === "article" && resource.pdf_url && (
              <a href={resource.pdf_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-orange-600 font-medium hover:underline">
                View PDF →
              </a>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 font-medium hover:underline">
              {OPEN_LABEL[resource.resource_type] || "Open →"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Resources() {
  const { isAdmin, user } = useAuth();
  const [resources, setResources] = useState([]);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [typeFilter,setTypeFilter]= useState("all");
  const [showForm,  setShowForm]  = useState(false);

  useEffect(() => { fetchResources(); fetchServices(); }, []);

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
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err.message);
    }
  };

  const filtered = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      r.title?.toLowerCase().includes(q) ||
      r.service_title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.added_by_name?.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || r.resource_type === typeFilter;
    return matchSearch && matchType;
  });

  const countOf = (type) =>
    type === "all" ? resources.length : resources.filter((r) => r.resource_type === type).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-0.5">Lectures, videos, PDFs & learning materials</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
          {showForm ? "Cancel" : "+ Add Resource"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="mb-6">
          <ResourceForm
            serviceId={null}
            services={services}
            onAdd={(r) => { setResources((prev) => [r, ...prev]); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Search + Filter row */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, service, description or name..."
          className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-700 min-w-[150px]"
        >
          <option value="all">All Types ({countOf("all")})</option>
          <option value="video">Video ({countOf("video")})</option>
          <option value="pdf">PDF ({countOf("pdf")})</option>
          <option value="article">Article ({countOf("article")})</option>
          <option value="other">Other ({countOf("other")})</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-24 text-gray-400">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          {search || typeFilter !== "all" ? "No resources match your filters." : "No resources yet. Add one!"}
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} onDelete={handleDelete}
                isAdmin={isAdmin} currentUid={user?.uid} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}