import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI, serviceAPI, employeeAPI } from "../../services/api";

export default function Profile() {
  const { user, dbUser, refreshUser } = useAuth();
  const fileRef = useRef();
  const dropRef = useRef();

  const [form, setForm] = useState({
    full_name:   "",
    designation: "",
    department:  "",
    phone:       "",
  });
  const [avatarUrl,  setAvatarUrl]  = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  // ── Skills state ──
  const [mySkills,      setMySkills]      = useState([]);
  const [allServices,   setAllServices]   = useState([]);
  const [skillLoading,  setSkillLoading]  = useState(false);
  const [skillError,    setSkillError]    = useState("");

  const [searchText,    setSearchText]    = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null); // from dropdown
  const [showDrop,      setShowDrop]      = useState(false);

  // Normalize service_id to String always
  const dedup = (list) =>
    Array.from(
      new Map(list.map((s) => [String(s.service_id), s])).values()
    );

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

  useEffect(() => {
    fetchSkills();
    fetchAllServices();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await userAPI.getProfile();
      const services = res.data.profile?.known_services || [];
      setMySkills(dedup(services));
    } catch (err) {
      console.error("fetchSkills error:", err.message);
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

  const mySkillIds  = new Set(mySkills.map((s) => String(s.service_id)));
  const mySkillTitles = new Set(mySkills.map((s) => s.title?.trim().toLowerCase()));

  const availableServices = allServices.filter(
    (s) => !mySkillIds.has(String(s.id))
  );

  const filteredServices = availableServices.filter((s) =>
    s.title.toLowerCase().includes(searchText.toLowerCase())
  );

  // ── Add skill ──
  // Two modes:
  // 1. selectedSkill != null  → user picked from dropdown → add by service_id
  // 2. selectedSkill == null  → user typed custom text    → add as custom title
  const handleAddSkill = async () => {
    const trimmed = searchText.trim();

    if (!trimmed) {
      setSkillError("Type something or select from the dropdown.");
      return;
    }

    // ── Mode 1: dropdown selection ──
    if (selectedSkill) {
      if (mySkillIds.has(String(selectedSkill.id))) {
        setSkillError("This service is already added.");
        return;
      }

      setSkillError("");
      setSearchText("");
      setShowDrop(false);
      setSelectedSkill(null);
      setSkillLoading(true);

      // Optimistic
      setMySkills((prev) =>
        dedup([...prev, { service_id: String(selectedSkill.id), title: selectedSkill.title }])
      );

      try {
        await employeeAPI.addSkill({ service_id: selectedSkill.id });
        const res = await userAPI.getProfile();
        setMySkills(dedup(res.data.profile?.known_services || []));
      } catch (err) {
        console.error("addSkill error:", err.message);
        setMySkills((prev) =>
          prev.filter((s) => String(s.service_id) !== String(selectedSkill.id))
        );
        setSkillError("Failed to add skill. Please try again.");
      } finally {
        setSkillLoading(false);
      }
      return;
    }

    // ── Mode 2: custom free-text skill ──
    // Check duplicate by title (case-insensitive)
    if (mySkillTitles.has(trimmed.toLowerCase())) {
      setSkillError("This skill is already added.");
      return;
    }

    setSkillError("");
    setSearchText("");
    setShowDrop(false);
    setSkillLoading(true);

    // Use a unique temp key for optimistic entry
    const tempId = `custom_${Date.now()}`;

    // Optimistic add
    setMySkills((prev) =>
      dedup([...prev, { service_id: tempId, title: trimmed }])
    );

    try {
      await employeeAPI.addCustomSkill({ title: trimmed });
      // Re-fetch to get real service_id from server
      const res = await userAPI.getProfile();
      setMySkills(dedup(res.data.profile?.known_services || []));
    } catch (err) {
      console.error("addCustomSkill error:", err.message);
      // Rollback optimistic entry
      setMySkills((prev) => prev.filter((s) => s.service_id !== tempId));
      setSkillError("Failed to add skill. Please try again.");
    } finally {
      setSkillLoading(false);
    }
  };

  // ── Remove skill ──
  const handleRemoveSkill = async (serviceId) => {
    const removed = mySkills.find(
      (s) => String(s.service_id) === String(serviceId)
    );
    setMySkills((prev) =>
      prev.filter((s) => String(s.service_id) !== String(serviceId))
    );
    try {
      await employeeAPI.removeSkill(serviceId);
    } catch (err) {
      console.error("removeSkill error:", err.message);
      if (removed) setMySkills((prev) => dedup([...prev, removed]));
    }
  };

  // Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddSkill();
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

  // Add button enabled if there's any text (dropdown selected OR free text typed)
  const canAdd = searchText.trim().length > 0 && !skillLoading;

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
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Profile Photo
        </h2>
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
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Basic Information
        </h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
              </label>
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
          My Skills
        </h2>

        <div className="relative mb-3" ref={dropRef}>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSelectedSkill(null); // clear dropdown selection when typing
                setShowDrop(true);
                setSkillError("");
              }}
              onFocus={() => setShowDrop(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search services or type a custom skill..."
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {/* Enabled as long as there is any text — dropdown pick OR free text */}
            <button
              onClick={handleAddSkill}
              disabled={!canAdd}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition whitespace-nowrap"
            >
              {skillLoading ? "Adding..." : "Add"}
            </button>
          </div>

          {/* Dropdown — existing services not yet added */}
          {showDrop && filteredServices.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
              {filteredServices.map((s) => (
                <button
                  key={s.id}
                  onMouseDown={() => {
                    setSelectedSkill(s);
                    setSearchText(s.title);
                    setShowDrop(false);
                    setSkillError("");
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition first:rounded-t-xl last:rounded-b-xl ${
                    selectedSkill?.id === s.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Show hint when no dropdown match — custom skill will be added */}
          {showDrop && searchText.trim() && filteredServices.length === 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
              <p className="text-sm text-gray-500">
                No match found —{" "}
                <span className="font-medium text-blue-600">
                  "{searchText.trim()}"
                </span>{" "}
                will be added as a custom skill.
              </p>
            </div>
          )}
        </div>

        {skillError && (
          <p className="text-xs text-red-500 mb-3">{skillError}</p>
        )}

        {/* Skills list */}
        {mySkills.length === 0 ? (
          <p className="text-sm text-gray-400">
            No skills added yet. Search and add from above.
          </p>
        ) : (
          <div className="space-y-2 mt-3">
            {mySkills.map((skill) => (
              <div
                key={skill.service_id}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-800">{skill.title}</span>
                <button
                  onClick={() => handleRemoveSkill(skill.service_id)}
                  className="text-gray-300 hover:text-red-500 transition text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Account Info ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Account Info
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              dbUser?.role === "admin"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {dbUser?.role === "admin" ? "🔑 Admin" : "👤 Employee"}
          </span>
          <span className="text-sm text-gray-500">
            Member since{" "}
            {dbUser?.created_at
              ? new Date(dbUser.created_at).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>

      {/* Save */}
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