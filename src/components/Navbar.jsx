import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Bell } from "lucide-react";

const Navbar = () => {
  const { user, dbUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/services?search=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </form>

      {/* ── Right Side ── */}
      <div className="flex items-center gap-4 ml-4">

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Role Badge */}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isAdmin
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isAdmin ? "Admin" : "Employee"}
        </span>

        {/* ✅ Clickable Avatar — click karo profile open ho */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          title="View Profile"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-transparent hover:ring-blue-300 transition-all">
            {dbUser?.avatar_url ? (
              <img
                src={dbUser.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {dbUser?.full_name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {dbUser?.full_name || user?.displayName || "User"}
          </span>
        </button>

      </div>
    </header>
  );
};

export default Navbar;