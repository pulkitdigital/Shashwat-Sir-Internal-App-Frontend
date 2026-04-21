// import { useState, useEffect } from "react";
// import { learningAPI, serviceAPI, resourceAPI } from "../../services/api"; // ✅ resourceAPI add

// // ─── Resource icon helper ──────────────────────────────────────────────────────
// const resourceIcon = (type) => {
//   if (type === "video")   return "🎥";
//   if (type === "pdf")     return "📄";
//   if (type === "article") return "📝";
//   return "🔗";
// };

// // ─── Learning Card (My List) ───────────────────────────────────────────────────
// const LearningCard = ({ item, onToggle, resources }) => (
//   <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition">
//     <div className="flex items-start justify-between gap-3">
//       <div className="flex-1 min-w-0">
//         <h3 className="font-semibold text-gray-900">{item.title}</h3>
//         <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
//           {item.category || "General"}
//         </span>
//         <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>

//         {/* ✅ Resources */}
//         {resources?.length > 0 && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {resources.map((r) => (
//               <a
//                 key={r.id}
//                 href={r.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-medium hover:bg-purple-100 transition"
//               >
//                 {resourceIcon(r.resource_type)} {r.title}
//               </a>
//             ))}
//           </div>
//         )}
//       </div>

//       <button
//         onClick={() => onToggle(item.service_id)}
//         className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200"
//       >
//         ✓ Marked
//       </button>
//     </div>

//     <div className="mt-3 pt-3 border-t border-gray-100">
//       <p className="text-xs text-purple-600 font-medium">
//         📚 Status: {item.status || "interested"}
//       </p>
//     </div>
//   </div>
// );

// // ─── Service Card (All Services) ───────────────────────────────────────────────
// const ServiceCard = ({ service, onMark, resources }) => (
//   <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-sm transition">
//     <div className="flex items-start justify-between gap-3">
//       <div className="flex-1 min-w-0">
//         <h3 className="font-semibold text-gray-900">{service.title}</h3>
//         <span className="inline-block mt-1 px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
//           {service.category || "General"}
//         </span>
//         <p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.description}</p>

//         {/* ✅ Resources */}
//         {resources?.length > 0 && (
//           <div className="mt-3 flex flex-wrap gap-2">
//             {resources.map((r) => (
//               <a
//                 key={r.id}
//                 href={r.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-full text-xs font-medium hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition"
//               >
//                 {resourceIcon(r.resource_type)} {r.title}
//               </a>
//             ))}
//           </div>
//         )}
//       </div>

//       <button
//         onClick={() => onMark(service.id)}
//         className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600"
//       >
//         + Mark
//       </button>
//     </div>
//   </div>
// );

// // ─── Main Page ─────────────────────────────────────────────────────────────────
// export default function Learning() {
//   const [myLearning, setMyLearning]     = useState([]);
//   const [allServices, setAllServices]   = useState([]);
//   const [resourcesMap, setResourcesMap] = useState({}); // ✅ { service_id: [resources] }
//   const [loading, setLoading]           = useState(true);
//   const [activeTab, setActiveTab]       = useState("my"); // ✅ "my" pehle
//   const [search, setSearch]             = useState("");

//   useEffect(() => { fetchData(); }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [learnRes, svcRes, resourceRes] = await Promise.all([
//         learningAPI.getMine(),
//         serviceAPI.getAll(),
//         resourceAPI.getAll(), // ✅ sab resources ek saath
//       ]);

//       setMyLearning(learnRes.data.learning || []);
//       setAllServices(svcRes.data.services || []);

//       // ✅ Resources ko service_id ke hisaab se group karo
//       const allResources = resourceRes.data.resources || [];
//       const grouped = allResources.reduce((acc, r) => {
//         if (!r.service_id) return acc;
//         if (!acc[r.service_id]) acc[r.service_id] = [];
//         acc[r.service_id].push(r);
//         return acc;
//       }, {});
//       setResourcesMap(grouped);

//     } catch (err) {
//       console.error("Failed to fetch learning data:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMark = async (serviceId) => {
//     const service = allServices.find((s) => s.id === serviceId);
//     if (!service) return;

//     const optimisticEntry = {
//       service_id:  service.id,
//       title:       service.title,
//       category:    service.category,
//       description: service.description,
//       status:      "interested",
//     };
//     setMyLearning((prev) => [...prev, optimisticEntry]);

//     try {
//       await learningAPI.add({ service_id: serviceId });
//     } catch (err) {
//       console.error("Mark failed:", err.message);
//       setMyLearning((prev) => prev.filter((l) => l.service_id !== serviceId));
//     }
//   };

//   const handleToggle = async (serviceId) => {
//     const removed = myLearning.find((l) => l.service_id === serviceId);
//     setMyLearning((prev) => prev.filter((l) => l.service_id !== serviceId));

//     try {
//       await learningAPI.remove(serviceId);
//     } catch (err) {
//       console.error("Remove failed:", err.message);
//       if (removed) setMyLearning((prev) => [...prev, removed]);
//     }
//   };

//   const myLearningIds    = new Set(myLearning.map((l) => l.service_id));
//   const unmarkedServices = allServices.filter((s) => !myLearningIds.has(s.id));

//   const filteredMy = myLearning.filter(
//     (s) =>
//       s.title?.toLowerCase().includes(search.toLowerCase()) ||
//       s.category?.toLowerCase().includes(search.toLowerCase())
//   );

//   const filteredAll = unmarkedServices.filter(
//     (s) =>
//       s.title?.toLowerCase().includes(search.toLowerCase()) ||
//       s.category?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Learning Module</h1>
//         <p className="text-sm text-gray-500 mt-0.5">
//           Mark services you want to learn — help the firm know your growth goals.
//         </p>
//       </div>

//       {/* ✅ Tabs — My List pehle */}
//       <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
//         {[
//           { key: "my",  label: `Want to Learn (${myLearning.length})` },
//           { key: "all", label: `All Services (${unmarkedServices.length})` },
//         ].map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
//               activeTab === tab.key
//                 ? "bg-white text-gray-900 shadow-sm"
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Search */}
//       <div className="mb-5">
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="🔍  Search services..."
//           className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
//         />
//       </div>

//       {/* Content */}
//       {loading ? (
//         <div className="text-center py-24 text-gray-400">Loading...</div>
//       ) : activeTab === "my" ? (
//         filteredMy.length === 0 ? (
//           <div className="text-center py-24 text-gray-400 text-sm">
//             You haven't marked any services yet.{" "}
//             <button
//               onClick={() => setActiveTab("all")}
//               className="text-purple-500 hover:underline"
//             >
//               Browse All Services →
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {filteredMy.map((item) => (
//               <LearningCard
//                 key={item.service_id}
//                 item={item}
//                 onToggle={handleToggle}
//                 resources={resourcesMap[item.service_id] || []} // ✅
//               />
//             ))}
//           </div>
//         )
//       ) : filteredAll.length === 0 ? (
//         <div className="text-center py-24 text-gray-400 text-sm">No services found.</div>
//       ) : (
//         <div className="space-y-3">
//           {filteredAll.map((service) => (
//             <ServiceCard
//               key={service.id}
//               service={service}
//               onMark={handleMark}
//               resources={resourcesMap[service.id] || []} // ✅
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }













import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { learningAPI, serviceAPI, resourceAPI } from "../../services/api";
import {
  BookOpen, Search, Loader2, CheckCircle2,
  Circle, Save, X, Plus, ExternalLink, Users, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const resourceIcon = (type) => {
  if (type === "video")   return "🎥";
  if (type === "pdf")     return "📄";
  if (type === "article") return "📝";
  return "🔗";
};

const StatusBadge = ({ status }) => {
  const map = {
    interested:  { label: "Interested",  cls: "bg-purple-50 text-purple-600 border-purple-100" },
    in_progress: { label: "In Progress", cls: "bg-blue-50 text-blue-600 border-blue-100"       },
    completed:   { label: "Completed",   cls: "bg-green-50 text-green-600 border-green-100"    },
  };
  const { label, cls } = map[status] || map.interested;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
};

// ─── Add Modal (Employee) ──────────────────────────────────────────────────────
const AddModal = ({ unmarked, resourcesMap, onClose, onSave, saving }) => {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = unmarked.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle    = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = ()   => setSelected(new Set(filtered.map((s) => s.id)));
  const clearAll  = ()   => setSelected(new Set());

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Want to Learn</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select topics you want to learn</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
            <X size={15} />
          </button>
        </div>

        {/* Search + controls */}
        <div className="px-5 py-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-xs text-gray-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-3">
              {selected.size > 0 && (
                <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full">
                  {selected.size} selected
                </span>
              )}
              {selected.size < filtered.length ? (
                <button onClick={selectAll} className="text-xs text-purple-500 hover:underline">Select all</button>
              ) : (
                <button onClick={clearAll}  className="text-xs text-gray-400 hover:underline">Clear all</button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 pb-3">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">No items found.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const isChecked = selected.has(item.id);
                const resources = resourcesMap[item.id] || [];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`flex items-start gap-3 rounded-xl px-3 py-3 cursor-pointer border transition-all ${
                      isChecked ? "border-purple-300 bg-purple-50" : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked
                        ? <CheckCircle2 size={17} className="text-purple-500" />
                        : <Circle       size={17} className="text-gray-300"   />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold ${isChecked ? "text-purple-900" : "text-gray-900"}`}>
                          {item.title}
                        </p>
                        {item.category && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                      )}
                      {resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                          {resources.map((r) => (
                            <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[10px] font-medium hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition"
                            >
                              {resourceIcon(r.resource_type)} {r.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onSave(selected, onClose)}
            disabled={selected.size === 0 || saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving
              ? "Saving..."
              : selected.size === 0
                ? "Select at least one item"
                : `Add ${selected.size} Item${selected.size > 1 ? "s" : ""}`
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin View ────────────────────────────────────────────────────────────────
const AdminView = ({ allLearning, loading, resourcesMap }) => {
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState(new Set());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-500" />
      </div>
    );
  }

  // Group by employee
  const byEmployee = allLearning.reduce((acc, item) => {
    const uid = item.firebase_uid;
    if (!acc[uid]) {
      acc[uid] = {
        firebase_uid: uid,
        full_name:    item.full_name    || "Unknown",
        email:        item.email        || "",
        designation:  item.designation  || "",
        items: [],
      };
    }
    acc[uid].items.push(item);
    return acc;
  }, {});

  const employees = Object.values(byEmployee).sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  const filtered = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.items.some((i) =>
        (i.service_title || i.title || "").toLowerCase().includes(search.toLowerCase())
      )
  );

  const toggleExpand = (uid) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(uid) ? n.delete(uid) : n.add(uid);
      return n;
    });
  };

  // Summary counts per topic across all employees
  const topicCount = allLearning.reduce((acc, item) => {
    const title = item.service_title || item.title || "Unknown";
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});

  const topTopics = Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-0 pb-10">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Want to Learn — Overview</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          See what every employee wants to learn
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-600">{employees.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Employees with interests</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-600">{allLearning.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total learning interests</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Topics</p>
          <div className="flex flex-col gap-1">
            {topTopics.map(([title, count]) => (
              <div key={title} className="flex items-center justify-between">
                <p className="text-xs text-gray-700 truncate flex-1">{title}</p>
                <span className="text-xs font-semibold text-purple-600 ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee or topic..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Employee cards */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No results found.</p>
      ) : (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Employees ({filtered.length})
          </p>
          <div className="space-y-3">
            {filtered.map((emp) => {
              const isOpen = expanded.has(emp.firebase_uid);
              return (
                <div key={emp.firebase_uid} className="bg-white border border-gray-100 rounded-xl overflow-hidden">

                  {/* Employee row — click to expand */}
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggleExpand(emp.firebase_uid)}
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {emp.full_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{emp.full_name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {emp.designation || emp.email}
                      </p>
                    </div>

                    {/* Badge + chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-purple-50 text-purple-600 font-semibold px-2.5 py-1 rounded-full border border-purple-100">
                        {emp.items.length} topic{emp.items.length !== 1 ? "s" : ""}
                      </span>
                      {isOpen
                        ? <ChevronUp   size={15} className="text-gray-400" />
                        : <ChevronDown size={15} className="text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded — topics list */}
                  {isOpen && (
                    <div className="border-t border-gray-50 px-4 py-3 bg-gray-50">
                      <div className="flex flex-wrap gap-2">
                        {emp.items.map((item) => {
                          const itemResources = resourcesMap[item.service_id] || [];
                          return (
                            <div
                              key={item.service_id || item.id}
                              className="flex flex-col gap-1.5 bg-white border border-purple-100 rounded-lg px-3 py-2"
                            >
                              {/* Title + Status */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <BookOpen size={11} className="text-purple-400 shrink-0" />
                                <span className="text-xs font-medium text-gray-700">
                                  {item.service_title || item.title}
                                </span>
                                <StatusBadge status={item.status} />
                              </div>
                              {/* Resource Links */}
                              {itemResources.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pl-4">
                                  {itemResources.map((r) => (
                                    <a
                                      key={r.id}
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-medium hover:bg-purple-100 transition"
                                    >
                                      {resourceIcon(r.resource_type)} {r.title} <ExternalLink size={9} />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Employee View ─────────────────────────────────────────────────────────────
const EmployeeView = () => {
  const [myLearning,   setMyLearning]   = useState([]);
  const [allServices,  setAllServices]  = useState([]);
  const [resourcesMap, setResourcesMap] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [search,       setSearch]       = useState("");
  const [toast,        setToast]        = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [learnRes, svcRes, resRes] = await Promise.all([
        learningAPI.getMine(),
        serviceAPI.getAll(),
        resourceAPI.getAll(),
      ]);
      setMyLearning(learnRes.data.learning || []);
      setAllServices(svcRes.data.services  || []);
      const grouped = (resRes.data.resources || []).reduce((acc, r) => {
        if (!r.service_id) return acc;
        if (!acc[r.service_id]) acc[r.service_id] = [];
        acc[r.service_id].push(r);
        return acc;
      }, {});
      setResourcesMap(grouped);
    } catch (err) {
      console.error("Learning fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async (selected, closeModal) => {
    if (selected.size === 0) return;
    setSaving(true);
    const newEntries = allServices
      .filter((s) => selected.has(s.id))
      .map((s) => ({ service_id: s.id, title: s.title, category: s.category, description: s.description, status: "interested" }));
    setMyLearning((prev) => [...prev, ...newEntries]);
    closeModal();
    try {
      await Promise.all([...selected].map((id) => learningAPI.add({ service_id: id })));
      showToast(`✅ ${newEntries.length} item${newEntries.length > 1 ? "s" : ""} added to your list!`);
    } catch (err) {
      console.error("Save failed:", err.message);
      setMyLearning((prev) => prev.filter((l) => !newEntries.some((e) => e.service_id === l.service_id)));
      showToast("❌ Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (serviceId) => {
    const removed = myLearning.find((l) => l.service_id === serviceId);
    setMyLearning((prev) => prev.filter((l) => l.service_id !== serviceId));
    try {
      await learningAPI.remove(serviceId);
    } catch {
      if (removed) setMyLearning((prev) => [...prev, removed]);
    }
  };

  const markedIds   = new Set(myLearning.map((l) => l.service_id));
  const unmarked    = allServices.filter((s) => !markedIds.has(s.id));
  const filteredMy  = myLearning.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-0 pb-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Want to Learn</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Topics you want to learn</p>
        </div>
        {unmarked.length > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-purple-200 shrink-0"
          >
            <Plus size={15} /> Add
          </button>
        )}
      </div>

      {/* Search */}
      {myLearning.length > 0 && (
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your list..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      )}

      {/* List */}
      {myLearning.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-400">Your list is empty</p>
          <p className="text-xs text-gray-300 mt-1 mb-4">Add topics you want to learn</p>
          {unmarked.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition"
            >
              <Plus size={14} /> Add Topics
            </button>
          )}
        </div>
      ) : filteredMy.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">No results found.</p>
      ) : (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Want to Learn ({filteredMy.length})
          </p>
          <div className="space-y-2">
            {filteredMy.map((item) => (
              <div key={item.service_id} className="bg-white border border-purple-100 rounded-xl px-4 py-3.5 flex items-start gap-3">
                <CheckCircle2 size={17} className="text-purple-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <StatusBadge status={item.status} />
                    {item.category && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {(resourcesMap[item.service_id] || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {resourcesMap[item.service_id].map((r) => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-medium hover:bg-purple-100 transition"
                        >
                          {resourceIcon(r.resource_type)} {r.title} <ExternalLink size={9} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item.service_id)}
                  className="shrink-0 text-gray-300 hover:text-red-400 transition mt-0.5"
                  title="Remove"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <AddModal
          unmarked={unmarked}
          resourcesMap={resourcesMap}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
};

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function Learning() {
  const { dbUser } = useAuth();
  const isAdmin = dbUser?.role === "admin";

  const [allLearning,  setAllLearning]  = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [resourcesMap, setResourcesMap] = useState({});

  useEffect(() => {
    if (!isAdmin) return;
    const fetchAll = async () => {
      setAdminLoading(true);
      try {
        const [learnRes, resRes] = await Promise.all([
          learningAPI.getAll(),
          resourceAPI.getAll(),
        ]);
        setAllLearning(learnRes.data.learning || []);

        const grouped = (resRes.data.resources || []).reduce((acc, r) => {
          if (!r.service_id) return acc;
          if (!acc[r.service_id]) acc[r.service_id] = [];
          acc[r.service_id].push(r);
          return acc;
        }, {});
        setResourcesMap(grouped);
      } catch (err) {
        console.error("Admin learning fetch error:", err.message);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAll();
  }, [isAdmin]);

  if (isAdmin) {
    return <AdminView allLearning={allLearning} loading={adminLoading} resourcesMap={resourcesMap} />;
  }

  return <EmployeeView />;
}