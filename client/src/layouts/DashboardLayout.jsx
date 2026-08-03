import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiBell } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const { user, logout, role } = useAuth();
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

  const sidebarItems = role === "client"
    ? [
        { path: "/client", label: "Dashboard", icon: FiMenu },
        { path: "/client/create-project", label: "Create Project", icon: FiMenu },
        { path: "/client/my-projects", label: "My Projects", icon: FiMenu },
        { path: "/settings", label: "Settings", icon: FiMenu },
      ]
    : role === "freelancer"
    ? [
        { path: "/freelancer", label: "Dashboard", icon: FiMenu },
        { path: "/freelancer/browse-projects", label: "Browse Projects", icon: FiMenu },
        { path: "/settings", label: "Profile", icon: FiMenu },
      ]
    : [
        { path: "/admin", label: "Dashboard", icon: FiMenu },
        { path: "/admin/projects", label: "Projects", icon: FiMenu },
        { path: "/admin/users", label: "Users", icon: FiMenu },
        { path: "/settings", label: "Settings", icon: FiMenu },
      ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6366F1]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      <Sidebar user={user} items={sidebarItems} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />

      <div className="lg:pl-72 flex min-h-screen flex-col">
        <Navbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onSearch={() => {}}
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          user={user}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
