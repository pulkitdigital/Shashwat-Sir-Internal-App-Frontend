import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";

export default function Profile() {
  const { user, dbUser, refreshUser } = useAuth();
  const fileRef = useRef();

  const [form, setForm] = useState({
    full_name:   "",
    designation: "",
    department:  "",
    phone:       "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState("");
  const [error, setError]         = useState("");

  // ✅ Load from dbUser (PostgreSQL)
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Upload to Cloudinary (Free) → save URL to PostgreSQL
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
    // ✅ folder line remove — preset ka ca-profiles folder use hoga

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const errData = await res.json();
      console.error("Cloudinary error:", errData); // ← exact error dikhega
      throw new Error("Cloudinary upload failed");
    }

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

  // ✅ PUT /api/users/profile → refresh dbUser context
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

      {/* Photo */}
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

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h2>

        {/* Email — read only, from Firebase */}
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

      {/* Role Badge */}
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