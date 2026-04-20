// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { userAPI } from "../../services/api";

// export default function Profile() {
//   const { user, dbUser, refreshUser } = useAuth();
//   const fileRef = useRef();

//   const [form, setForm] = useState({
//     full_name:   "",
//     designation: "",
//     department:  "",
//     phone:       "",
//   });
//   const [avatarUrl, setAvatarUrl] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving]       = useState(false);
//   const [success, setSuccess]     = useState("");
//   const [error, setError]         = useState("");

//   // ✅ Load from dbUser (PostgreSQL)
//   useEffect(() => {
//     if (dbUser) {
//       setForm({
//         full_name:   dbUser.full_name   || "",
//         designation: dbUser.designation || "",
//         department:  dbUser.department  || "",
//         phone:       dbUser.phone       || "",
//       });
//       setAvatarUrl(dbUser.avatar_url || "");
//     }
//   }, [dbUser]);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   // ✅ Upload to Cloudinary (Free) → save URL to PostgreSQL
//   const handlePhotoUpload = async (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   if (file.size > 2 * 1024 * 1024) {
//     setError("File size must be less than 2MB.");
//     return;
//   }

//   setUploading(true);
//   setError("");

//   try {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
//     // ✅ folder line remove — preset ka ca-profiles folder use hoga

//     const res = await fetch(
//       `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
//       { method: "POST", body: formData }
//     );

//     if (!res.ok) {
//       const errData = await res.json();
//       console.error("Cloudinary error:", errData); // ← exact error dikhega
//       throw new Error("Cloudinary upload failed");
//     }

//     const data = await res.json();
//     setAvatarUrl(data.secure_url);
//     await userAPI.updateProfile({ avatar_url: data.secure_url });
//     await refreshUser();
//   } catch (err) {
//     setError("Photo upload failed. Try again.");
//     console.error(err.message);
//   } finally {
//     setUploading(false);
//   }
// };

//   // ✅ PUT /api/users/profile → refresh dbUser context
//   const handleSave = async () => {
//     setSaving(true);
//     setSuccess("");
//     setError("");
//     try {
//       await userAPI.updateProfile({ ...form, avatar_url: avatarUrl });
//       await refreshUser();
//       setSuccess("Profile updated successfully!");
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (err) {
//       setError("Failed to save profile. Please try again.");
//       console.error(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

//       {success && (
//         <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
//           {success}
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
//           {error}
//         </div>
//       )}

//       {/* Photo */}
//       <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
//         <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Profile Photo</h2>
//         <div className="flex items-center gap-5">
//           <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
//             {avatarUrl ? (
//               <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//             ) : (
//               <span className="text-3xl text-gray-400 font-semibold">
//                 {dbUser?.full_name?.charAt(0) || "?"}
//               </span>
//             )}
//           </div>
//           <div>
//             <button
//               onClick={() => fileRef.current.click()}
//               disabled={uploading}
//               className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
//             >
//               {uploading ? "Uploading..." : "Change Photo"}
//             </button>
//             <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 2MB</p>
//             <input
//               ref={fileRef}
//               type="file"
//               accept="image/jpeg,image/png"
//               onChange={handlePhotoUpload}
//               className="hidden"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Basic Info */}
//       <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
//         <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h2>

//         {/* Email — read only, from Firebase */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
//           <input
//             type="email"
//             value={user?.email || ""}
//             disabled
//             className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-400 bg-gray-50"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {[
//             { label: "Full Name",   name: "full_name",   placeholder: "Rahul Sharma" },
//             { label: "Designation", name: "designation", placeholder: "CA, Article Assistant..." },
//             { label: "Department",  name: "department",  placeholder: "Audit, Tax, GST..." },
//             { label: "Phone",       name: "phone",       placeholder: "+91 98765 43210" },
//           ].map((field) => (
//             <div key={field.name}>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
//               <input
//                 type="text"
//                 name={field.name}
//                 value={form[field.name]}
//                 onChange={handleChange}
//                 placeholder={field.placeholder}
//                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Role Badge */}
//       <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
//         <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Account Info</h2>
//         <div className="flex items-center gap-3">
//           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//             dbUser?.role === "admin"
//               ? "bg-blue-100 text-blue-700"
//               : "bg-gray-100 text-gray-600"
//           }`}>
//             {dbUser?.role === "admin" ? "🔑 Admin" : "👤 Employee"}
//           </span>
//           <span className="text-sm text-gray-500">
//             Member since {dbUser?.created_at ? new Date(dbUser.created_at).toLocaleDateString() : "—"}
//           </span>
//         </div>
//       </div>

//       {/* Save */}
//       <button
//         onClick={handleSave}
//         disabled={saving}
//         className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition"
//       >
//         {saving ? "Saving..." : "Save Changes"}
//       </button>
//     </div>
//   );
// }


























import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI, serviceAPI, employeeAPI } from "../../services/api";

const PROFICIENCY_LEVELS = ["beginner", "intermediate", "expert"];

const proficiencyColor = (p) => {
  if (p === "expert")       return "bg-green-100 text-green-700 border-green-200";
  if (p === "intermediate") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
};

export default function Profile() {
  const { user, dbUser, refreshUser } = useAuth();
  const fileRef = useRef();

  const [form, setForm] = useState({
    full_name:   "",
    designation: "",
    department:  "",
    phone:       "",
  });
  const [avatarUrl, setAvatarUrl]   = useState("");
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");

  // ── Skills state ──
  const [myServices,    setMyServices]    = useState([]);  // employee ki current skills
  const [allServices,   setAllServices]   = useState([]);  // sab available services
  const [selectedSvc,   setSelectedSvc]   = useState("");  // dropdown selection
  const [selectedProf,  setSelectedProf]  = useState("beginner");
  const [skillLoading,  setSkillLoading]  = useState(false);
  const [skillError,    setSkillError]    = useState("");

  // ── Load profile ──
  useEffect(() => {
    if (dbUser) {
      setForm({
        full_name:   dbUser.full_name   || "",
        designation: dbUser.designation || "",
        department:  dbUser.department  || "",
        phone:       dbUser.phone       || "",
      });
      setAvatarUrl(dbUser.avatar_url || "");
    }
  }, [dbUser]);

  // ── Load skills + all services ──
  useEffect(() => {
    if (!user) return;
    fetchMySkills();
    fetchAllServices();
  }, [user]);

  const fetchMySkills = async () => {
    try {
      const res = await employeeAPI.getByUid(user.uid);
      setMyServices(res.data.employee.known_services || []);
    } catch (err) {
      console.error("fetchMySkills error:", err.message);
    }
  };

  const fetchAllServices = async () => {
    try {
      const res = await serviceAPI.getAll();
      setAllServices(res.data.services || []);
    } catch (err) {
      console.error("fetchAllServices error:", err.message);
    }
  };

  // ── Add skill ──
  const handleAddSkill = async () => {
    if (!selectedSvc) return;

    // Already added check
    const alreadyAdded = myServices.find(
      (s) => String(s.service_id) === String(selectedSvc)
    );
    if (alreadyAdded) {
      setSkillError("Yeh service already added hai.");
      return;
    }

    setSkillLoading(true);
    setSkillError("");
    try {
      await employeeAPI.addSkill({
        service_id:  parseInt(selectedSvc),
        proficiency: selectedProf,
      });
      await fetchMySkills();
      setSelectedSvc("");
      setSelectedProf("beginner");
    } catch (err) {
      setSkillError("Skill add karne mein error. Try again.");
      console.error(err.message);
    } finally {
      setSkillLoading(false);
    }
  };

  // ── Update proficiency ──
  const handleUpdateProficiency = async (serviceId, newProf) => {
    try {
      await employeeAPI.addSkill({
        service_id:  serviceId,
        proficiency: newProf,
      });
      setMyServices((prev) =>
        prev.map((s) =>
          s.service_id === serviceId ? { ...s, proficiency: newProf } : s
        )
      );
    } catch (err) {
      console.error("Update proficiency error:", err.message);
    }
  };

  // ── Remove skill ──
  const handleRemoveSkill = async (serviceId) => {
    try {
      await employeeAPI.removeSkill(serviceId);
      setMyServices((prev) => prev.filter((s) => s.service_id !== serviceId));
    } catch (err) {
      console.error("Remove skill error:", err.message);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Photo upload ──
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Cloudinary upload failed");
      const data = await res.json();
      setAvatarUrl(data.secure_url);
      await userAPI.updateProfile({ avatar_url: data.secure_url });
      await refreshUser();
    } catch (err) {
      setError("Photo upload failed. Try again.");
      console.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Save profile ──
  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await userAPI.updateProfile({ ...form, avatar_url: avatarUrl });
      await refreshUser();
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Services jo already add nahi ki — dropdown mein dikhao
  const availableServices = allServices.filter(
    (s) => !myServices.find((ms) => String(ms.service_id) === String(s.id))
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ── Photo ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400 font-semibold">
                {dbUser?.full_name?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <div>
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 2MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-400 bg-gray-50"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Full Name",   name: "full_name",   placeholder: "Rahul Sharma" },
            { label: "Designation", name: "designation", placeholder: "CA, Article Assistant..." },
            { label: "Department",  name: "department",  placeholder: "Audit, Tax, GST..." },
            { label: "Phone",       name: "phone",       placeholder: "+91 98765 43210" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              <input
                type="text"
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── My Skills ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          My Skills — Services I Know
        </h2>

        {/* Add new skill */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            value={selectedSvc}
            onChange={(e) => { setSelectedSvc(e.target.value); setSkillError(""); }}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select a service —</option>
            {availableServices.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>

          <select
            value={selectedProf}
            onChange={(e) => setSelectedProf(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROFICIENCY_LEVELS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={handleAddSkill}
            disabled={!selectedSvc || skillLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition"
          >
            {skillLoading ? "Adding..." : "+ Add Skill"}
          </button>
        </div>

        {skillError && (
          <p className="text-xs text-red-500 mb-3">{skillError}</p>
        )}

        {/* Current skills list */}
        {myServices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Koi skill add nahi ki — upar se service select karo
          </p>
        ) : (
          <div className="space-y-2">
            {myServices.map((s) => (
              <div
                key={s.service_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <span className="text-sm font-medium text-gray-800">{s.title}</span>
                <div className="flex items-center gap-2">
                  {/* Proficiency change */}
                  <select
                    value={s.proficiency || "beginner"}
                    onChange={(e) => handleUpdateProficiency(s.service_id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border font-medium focus:outline-none ${proficiencyColor(s.proficiency)}`}
                  >
                    {PROFICIENCY_LEVELS.map((p) => (
                      <option key={p} value={p}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveSkill(s.service_id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Account Info ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Account Info</h2>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            dbUser?.role === "admin"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            {dbUser?.role === "admin" ? "🔑 Admin" : "👤 Employee"}
          </span>
          <span className="text-sm text-gray-500">
            Member since {dbUser?.created_at ? new Date(dbUser.created_at).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>

      {/* ── Save Button ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}