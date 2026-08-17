import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiUser,
  FiFolder,
  FiUsers,
  FiSearch,
  FiSettings,
  FiBriefcase,
  FiFileText,
  FiMail,
  FiCheckSquare,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout() {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarItems =
    role === "client"
      ? [
          { path: "/client", label: "Dashboard", icon: FiGrid },
          { path: "/client/profile", label: "My Profile", icon: FiUser },
          { path: "/client/my-projects", label: "My Projects", icon: FiFolder },
          { path: "/invoices", label: "Invoices", icon: FiFileText },
          { path: "/messages", label: "Project Chat", icon: FiMessageSquare },
          { path: "/tasks", label: "Tasks", icon: FiCheckSquare },
          { path: "/client/freelancers", label: "Browse Freelancers", icon: FiUsers },
        ]
      : role === "freelancer"
      ? [
          { path: "/freelancer", label: "Dashboard", icon: FiGrid },
          { path: "/freelancer/profile", label: "My Profile", icon: FiUser },
          { path: "/freelancer/my-projects", label: "My Projects", icon: FiFolder },
          { path: "/invoices", label: "Invoices", icon: FiFileText },
          { path: "/messages", label: "Project Chat", icon: FiMessageSquare },
          { path: "/tasks", label: "My Tasks", icon: FiCheckSquare },
          { path: "/freelancer/browse-projects", label: "Browse Projects", icon: FiSearch },
          { path: "/freelancer/my-proposals", label: "My Proposals", icon: FiFileText },
          { path: "/freelancer/my-invitations", label: "My Invitations", icon: FiMail },
          { path: "/freelancer/clients", label: "Browse Clients", icon: FiBriefcase },
        ]
      : [
          { path: "/admin", label: "Dashboard", icon: FiGrid },
          { path: "/admin/projects", label: "Projects", icon: FiFolder },
          { path: "/admin/reports", label: "Reports & Analytics", icon: FiBarChart2 },
          { path: "/invoices", label: "Invoices", icon: FiFileText },
          { path: "/messages", label: "Project Chat", icon: FiMessageSquare },
          { path: "/tasks", label: "All Tasks", icon: FiCheckSquare },
          { path: "/admin/users", label: "Users", icon: FiUsers },
        ];

  return (
    <div className="min-h-screen bg-[#09090B] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-[#6366F1]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      <Sidebar
        user={user}
        items={sidebarItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-0"} flex min-h-screen flex-col`}>
        <Navbar
          onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
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
