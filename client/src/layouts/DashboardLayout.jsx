import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiMessageSquare,
  FiCreditCard,
  FiStar,
  FiUser,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiSearch
} from "react-icons/fi";

const sidebarItems = [
  { path: "/dashboard", name: "Dashboard", icon: FiGrid },
  { path: "/projects", name: "Projects", icon: FiFolder },
  { path: "/tasks", name: "Tasks", icon: FiCheckSquare },
  { path: "/messages", name: "Messages", icon: FiMessageSquare },
  { path: "/payments", name: "Payments", icon: FiCreditCard },
  { path: "/reviews", name: "Reviews", icon: FiStar },
  { path: "/profile", name: "Profile", icon: FiUser },
  { path: "/settings", name: "Settings", icon: FiSettings },
];

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex bg-gradient-mesh">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 glass-panel border-r border-[rgba(255,255,255,0.08)] z-30">
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-bold text-white text-lg font-display">F</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-display">
            FreelancerHub
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#6366F1]/20 to-[#3B82F6]/10 text-white border border-[#6366F1]/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 glass-panel border-r border-[rgba(255,255,255,0.08)] z-50 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center">
              <span className="font-bold text-white text-lg font-display">F</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight font-display">FreelancerHub</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#6366F1]/20 to-[#3B82F6]/10 text-white border border-[#6366F1]/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Sticky Navbar */}
        <header className="sticky top-0 z-20 w-full glass-panel border-b border-[rgba(255,255,255,0.08)] backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition"
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center relative w-64 lg:w-80">
              <FiSearch className="absolute left-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition group border border-transparent hover:border-[rgba(255,255,255,0.08)]">
              <FiBell className="w-5 h-5 group-hover:scale-105 transition duration-300" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </button>

            {/* Profile Dropdown / Meta */}
            <div className="flex items-center gap-3 pl-3 border-l border-[rgba(255,255,255,0.08)]">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">
                  {user?.fullName || "User Account"}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">
                  {user?.role || "Guest"}
                </p>
              </div>

              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || "Avatar"}
                  className="w-9 h-9 rounded-xl object-cover border border-[rgba(255,255,255,0.15)] ring-2 ring-indigo-500/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-xs text-white shadow-md border border-white/10 ring-2 ring-indigo-500/10">
                  {getInitials(user?.fullName)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
