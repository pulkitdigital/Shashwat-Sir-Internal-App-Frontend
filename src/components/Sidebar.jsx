import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BookOpen,
  Library,
  ShieldCheck,
  User,
  Zap,
} from "lucide-react";

// ─── Nav Item Config ───────────────────────────────────────────
const navItems = [
  { to: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { to: "/services",   label: "Services",   icon: Briefcase },
  { to: "/employees",  label: "Employees",  icon: Users },
  { to: "/learning",   label: "Learning",   icon: BookOpen },
  { to: "/resources",  label: "Resources",  icon: Library },
  { to: "/skills",     label: "Skills",     icon: Zap },
];

const adminItems = [
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

// ─── Sidebar Component ─────────────────────────────────────────
const Sidebar = () => {
  const { user, dbUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
      isActive ? "text-blue-600" : "text-gray-500"
    }`;

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR — hidden on mobile
      ══════════════════════════════════════════ */}
      <aside className="hidden md:flex w-60 h-screen bg-white border-r border-gray-200 flex-col shrink-0">

        {/* ── Logo ── */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">CA Portal</h1>
          <p className="text-xs text-gray-400 mt-0.5">Internal Management</p>
        </div>

        {/* ── Nav Links ── */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Admin
                </p>
              </div>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* ── User Info (Desktop) — logout Navbar dropdown mein hai ── */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 w-full hover:bg-gray-50 rounded-lg p-1 transition-colors"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
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
            <div className="min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {dbUser?.full_name || user?.displayName || "User"}
              </p>
              <p className="text-xs text-gray-400">
                {isAdmin ? "Admin" : "Employee"}
              </p>
            </div>
          </button>
          {/* ✅ Logout hata diya — Navbar ke avatar dropdown mein hai */}
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MOBILE BOTTOM NAV — logout removed ✅
          Navbar avatar dropdown se logout hoga
      ══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1">

        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={mobileLinkClass}>
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}

        {/* Admin — mobile mein bhi dikhao agar admin hai */}
        {/* {isAdmin && adminItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={mobileLinkClass}>
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))} */}

        {/* ── Profile tab — mobile mein avatar se profile/logout access ── */}
        {/* <NavLink to="/profile" className={mobileLinkClass}>
          <User size={20} />
          <span className="text-[10px]">Profile</span>
        </NavLink> */}

      </nav>

      {/* Mobile bottom nav height ka space */}
      <div className="md:hidden h-16 shrink-0" />
    </>
  );
};

export default Sidebar;