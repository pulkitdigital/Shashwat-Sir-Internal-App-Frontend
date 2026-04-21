// import { useState } from "react";
// import { resourceAPI } from "../services/api";

// const normalizeUrl = (url) => {
//   if (!url) return "#";
//   const t = url.trim();
//   if (!t) return "#";
//   if (/^https?:\/\//i.test(t)) return t;
//   if (t.startsWith("//")) return `https:${t}`;
//   return `https://${t}`;
// };

// // ─── ResourceForm ──────────────────────────────────────────────────────────────
// // Props:
// //   serviceId  — number | null
// //     • number  → service fix hai, dropdown nahi dikhega
// //     • null    → user choose kar sakta hai (Resources.jsx)
// //   services   — array (sirf tab chahiye jab serviceId === null)
// //   onAdd(resource) — naya resource milne par call hoga
// //   onCancel()      — optional cancel button
// // ──────────────────────────────────────────────────────────────────────────────
// export default function ResourceForm({ serviceId = null, services = [], onAdd, onCancel }) {
//   const [form, setForm] = useState({
//     title:         "",
//     url:           "",
//     description:   "",
//     resource_type: "video",
//     service_id:    serviceId !== null ? serviceId : "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState("");

//   const handleAdd = async () => {
//     if (!form.title.trim() || !form.url.trim()) {
//       setError("Title aur URL dono required hain.");
//       return;
//     }
//     setLoading(true);
//     setError("");
//     try {
//       const res = await resourceAPI.create({
//         ...form,
//         url:        normalizeUrl(form.url),
//         service_id: form.service_id ? parseInt(form.service_id) : null,
//       });
//       onAdd(res.data.resource);
//       // Reset (serviceId fixed rakho)
//       setForm({
//         title:         "",
//         url:           "",
//         description:   "",
//         resource_type: "video",
//         service_id:    serviceId !== null ? serviceId : "",
//       });
//     } catch (err) {
//       setError("Resource add nahi ho saka. Dobara try karein.");
//       console.error("Add resource failed:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 p-5">
//       <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
//         Add Resource
//       </h2>

//       {error && (
//         <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//           {error}
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
//         {/* Title */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
//           <input
//             type="text"
//             value={form.title}
//             onChange={(e) => setForm({ ...form, title: e.target.value })}
//             placeholder="e.g. GST Filing Tutorial"
//             className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />
//         </div>

//         {/* URL */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">URL *</label>
//           <input
//             type="text"
//             value={form.url}
//             onChange={(e) => setForm({ ...form, url: e.target.value })}
//             placeholder="https://youtube.com/watch?v=..."
//             className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />
//         </div>

//         {/* Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
//           <select
//             value={form.resource_type}
//             onChange={(e) => setForm({ ...form, resource_type: e.target.value })}
//             className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           >
//             <option value="video">Video</option>
//             <option value="article">Article</option>
//             <option value="pdf">PDF</option>
//             <option value="other">Other</option>
//           </select>
//         </div>

//         {/* Service dropdown — sirf tab dikhao jab serviceId prop fix na ho */}
//         {serviceId === null && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">
//               Related Service
//             </label>
//             <select
//               value={form.service_id}
//               onChange={(e) => setForm({ ...form, service_id: e.target.value })}
//               className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//             >
//               <option value="">None</option>
//               {services.map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.title}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Description — full width */}
//         <div className={serviceId === null ? "md:col-span-2" : "md:col-span-2"}>
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">
//             Description
//           </label>
//           <input
//             type="text"
//             value={form.description}
//             onChange={(e) => setForm({ ...form, description: e.target.value })}
//             placeholder="Optional short description"
//             className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />
//         </div>
//       </div>

//       <div className="flex gap-2">
//         <button
//           onClick={handleAdd}
//           disabled={loading}
//           className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition"
//         >
//           {loading ? "Adding..." : "Add Resource"}
//         </button>
//         {onCancel && (
//           <button
//             onClick={onCancel}
//             className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }





















import { useState, useRef } from "react";
import { resourceAPI } from "../services/api";
import { auth } from "../utils/firebaseConfig"; // needed to get token for upload request

const normalizeUrl = (url) => {
  if (!url) return "#";
  const t = url.trim();
  if (!t) return "#";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("//")) return `https:${t}`;
  return `https://${t}`;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:5000/api

// ─── Upload PDF to backend → Google Drive ────────────────────────────────────
const uploadPdfToBackend = async (file, onProgress) => {
  const token = await auth.currentUser.getIdToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("pdf", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.url); // Google Drive view link
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error || "Upload failed."));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));

    xhr.open("POST", `${API_BASE}/resources/upload-pdf`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });
};

// ─── PDF Upload Zone ──────────────────────────────────────────────────────────
const PdfUploadZone = ({ selectedFile, onClick }) => (
  <div
    onClick={onClick}
    className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition ${
      selectedFile
        ? "border-blue-400 bg-blue-50"
        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
    }`}
  >
    {selectedFile ? (
      <>
        <span className="text-3xl mb-1">📄</span>
        <p className="text-sm font-medium text-blue-700">{selectedFile.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <p className="text-xs text-blue-500 mt-1">Click to change</p>
      </>
    ) : (
      <>
        <span className="text-3xl mb-1">📂</span>
        <p className="text-sm text-gray-600 font-medium">Click to select a PDF file</p>
        <p className="text-xs text-gray-400 mt-0.5">Max 20 MB · Stored in Google Drive</p>
      </>
    )}
  </div>
);

// ─── Upload Progress Bar ──────────────────────────────────────────────────────
const ProgressBar = ({ progress, colorClass = "bg-blue-500" }) => (
  <div className="mt-2">
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>Uploading to Google Drive...</span>
      <span>{progress}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-1.5">
      <div
        className={`${colorClass} h-1.5 rounded-full transition-all`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// ─── ResourceForm ──────────────────────────────────────────────────────────────
// Props:
//   serviceId  — number | null
//     • number → service is fixed, no dropdown shown
//     • null   → user can choose (used in Resources.jsx)
//   services   — array (only needed when serviceId === null)
//   onAdd(resource) — called with the new resource on success
//   onCancel()      — optional cancel button handler
// ──────────────────────────────────────────────────────────────────────────────
export default function ResourceForm({ serviceId = null, services = [], onAdd, onCancel }) {
  const [form, setForm] = useState({
    title:         "",
    url:           "",
    description:   "",
    resource_type: "video",
    service_id:    serviceId !== null ? serviceId : "",
  });

  const [pdfMode, setPdfMode]             = useState("upload"); // "upload" | "url"
  const [selectedFile, setSelectedFile]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading]         = useState(false);

  const [articleHasPdf, setArticleHasPdf] = useState(false);
  const [articlePdfFile, setArticlePdfFile] = useState(null);
  const [articlePdfUrl, setArticlePdfUrl] = useState("");
  const [articlePdfProgress, setArticlePdfProgress] = useState(0);
  const [articlePdfUploading, setArticlePdfUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fileInputRef        = useRef(null);
  const articleFileInputRef = useRef(null);

  const isPdf     = form.resource_type === "pdf";
  const isArticle = form.resource_type === "article";
  const isVideo   = form.resource_type === "video";

  // ── Handlers ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setError("");
    if (!form.title.trim()) {
      setForm((p) => ({ ...p, title: file.name.replace(/\.pdf$/i, "").replace(/_/g, " ") }));
    }
  };

  const handleArticlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArticlePdfFile(file);
    setArticlePdfUploading(true);
    setArticlePdfProgress(0);
    try {
      const url = await uploadPdfToBackend(file, setArticlePdfProgress);
      setArticlePdfUrl(url);
    } catch (err) {
      setError(err.message || "Article PDF upload failed.");
    } finally {
      setArticlePdfUploading(false);
    }
  };

  const handleTypeChange = (newType) => {
    setForm((p) => ({ ...p, resource_type: newType, url: "" }));
    setSelectedFile(null);
    setPdfMode("upload");
    setArticleHasPdf(false);
    setArticlePdfFile(null);
    setArticlePdfUrl("");
    setError("");
    if (fileInputRef.current)        fileInputRef.current.value = "";
    if (articleFileInputRef.current) articleFileInputRef.current.value = "";
  };

  // ── Submit ──
  const handleAdd = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    let finalUrl = form.url;

    try {
      // PDF type — upload mode
      if (isPdf && pdfMode === "upload") {
        if (!selectedFile) {
          setError("Please select a PDF file or switch to URL mode.");
          setLoading(false);
          return;
        }
        setUploading(true);
        try {
          finalUrl = await uploadPdfToBackend(selectedFile, setUploadProgress);
        } catch (err) {
          setError(err.message || "PDF upload failed.");
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      } else {
        if (!form.url.trim()) { setError("URL is required."); setLoading(false); return; }
        finalUrl = normalizeUrl(form.url);
      }

      const payload = {
        ...form,
        url:        finalUrl,
        service_id: form.service_id ? parseInt(form.service_id) : null,
        description: form.description || null,
        // Article PDF stored in dedicated pdf_url field (clean, no hacks)
        pdf_url: isArticle && articleHasPdf && articlePdfUrl ? articlePdfUrl : null,
      };

      const res = await resourceAPI.create(payload);
      onAdd(res.data.resource);

      // Reset
      setForm({ title: "", url: "", description: "", resource_type: "video", service_id: serviceId !== null ? serviceId : "" });
      setSelectedFile(null);
      setPdfMode("upload");
      setArticleHasPdf(false);
      setArticlePdfFile(null);
      setArticlePdfUrl("");
      if (fileInputRef.current)        fileInputRef.current.value = "";
      if (articleFileInputRef.current) articleFileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to add resource. Please try again.");
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
          <input type="text" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. GST Filing Tutorial"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <select value={form.resource_type} onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="video">Video</option>
            <option value="article">Article</option>
            <option value="pdf">PDF</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* ── PDF ── */}
        {isPdf && (
          <div className="md:col-span-2">
            {/* Mode toggle */}
            <div className="flex gap-2 mb-3">
              {[
                { key: "upload", label: "Upload PDF" },
                { key: "url",    label: "Paste URL"  },
              ].map(({ key, label }) => (
                <button key={key} type="button"
                  onClick={() => {
                    setPdfMode(key);
                    if (key === "url") { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
                    else setForm((p) => ({ ...p, url: "" }));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    pdfMode === key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {pdfMode === "upload" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF File *</label>
                <PdfUploadZone selectedFile={selectedFile} onClick={() => fileInputRef.current?.click()} />
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                {uploading && <ProgressBar progress={uploadProgress} />}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PDF URL *</label>
                <input type="text" value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://drive.google.com/... or any direct PDF link"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Video / Other URL ── */}
        {(isVideo || form.resource_type === "other") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL *</label>
            <input type="text" value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder={isVideo ? "https://youtube.com/watch?v=..." : "https://..."}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        )}

        {/* ── Article ── */}
        {isArticle && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Article URL *</label>
              <input type="text" value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://example.com/article"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" checked={articleHasPdf}
                  onChange={(e) => { setArticleHasPdf(e.target.checked); if (!e.target.checked) { setArticlePdfFile(null); setArticlePdfUrl(""); if (articleFileInputRef.current) articleFileInputRef.current.value = ""; } }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Attach a PDF with this article</span>
              </label>
            </div>

            {articleHasPdf && (
              <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">
                  PDF Attachment — stored in Google Drive
                </p>
                {articlePdfUrl ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-700">PDF uploaded to Google Drive!</p>
                      <a href={articlePdfUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate block">
                        View PDF →
                      </a>
                    </div>
                    <button type="button"
                      onClick={() => { setArticlePdfUrl(""); setArticlePdfFile(null); if (articleFileInputRef.current) articleFileInputRef.current.value = ""; }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium">
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="block">
                      <PdfUploadZone
                        selectedFile={articlePdfFile}
                        onClick={() => articleFileInputRef.current?.click()}
                      />
                      <input ref={articleFileInputRef} type="file" accept="application/pdf"
                        onChange={handleArticlePdfChange} className="hidden" />
                    </label>
                    {articlePdfUploading && <ProgressBar progress={articlePdfProgress} colorClass="bg-blue-500" />}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Service Dropdown */}
        {serviceId === null && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Related Service</label>
            <select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">None</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        )}

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <input type="text" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional short description"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={loading || uploading || articlePdfUploading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition"
        >
          {uploading
            ? `Uploading ${uploadProgress}%...`
            : articlePdfUploading
            ? `Uploading PDF ${articlePdfProgress}%...`
            : loading
            ? "Adding..."
            : "Add Resource"}
        </button>
        {onCancel && (
          <button onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}