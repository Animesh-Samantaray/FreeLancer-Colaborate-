import { useEffect, useState } from "react";
import { FiUsers, FiFolder, FiShield, FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminDashboard = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [freelancerCount, setFreelancerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        setLoading(true);
        const [projRes, usersRes] = await Promise.all([
          api.get("/project"),
          api.get("/users"),
        ]);

        if (projRes.data?.success) {
          setProjectCount(projRes.data.count || projRes.data.projects?.length || 0);
        }
        if (usersRes.data?.success) {
          const usersList = usersRes.data.users || [];
          setUserCount(usersList.length);
          setClientCount(usersList.filter((u) => u.role === "client").length);
          setFreelancerCount(usersList.filter((u) => u.role === "freelancer").length);
        }
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading admin metrics..." />;
  }

  const stats = [
    { label: "Total Platform Users", value: `${userCount}`, icon: FiUsers, subtitle: `${clientCount} Clients · ${freelancerCount} Freelancers` },
    { label: "Total Projects", value: `${projectCount}`, icon: FiFolder, subtitle: "Posted platform briefs" },
    { label: "Active Clients", value: `${clientCount}`, icon: FiShield, subtitle: "Verified accounts" },
    { label: "Active Freelancers", value: `${freelancerCount}`, icon: FiTrendingUp, subtitle: "Available for hire" },
  ];

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 rounded-3xl p-8 overflow-hidden">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">Admin Console</p>
            <h1 className="mt-3 text-3xl font-bold text-white font-display">System Overview</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Monitor registered users, review posted client projects, and manage site access from your central admin console.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/admin/projects"
              className="rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-5 py-3 text-xs font-semibold text-white hover:brightness-110 transition shadow-lg shadow-indigo-500/20"
            >
              Manage Projects
            </Link>
            <Link
              to="/admin/users"
              className="rounded-3xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <div key={index} className="glass-card rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">{item.label}</p>
                <h2 className="mt-3 text-3xl font-extrabold text-white font-display">{item.value}</h2>
              </div>
              <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-3.5 text-[#6366F1]">
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-400 font-medium">{item.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card rounded-3xl border border-white/10 p-6 xl:col-span-2">
          <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">Quick Navigation</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/projects"
              className="rounded-2xl bg-white/5 p-5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">Project Directory</span>
                <span className="text-xs text-[#6366F1] font-semibold group-hover:translate-x-1 transition-transform inline-block">Manage →</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">View, search, and remove project listings from the platform.</p>
            </Link>
            <Link
              to="/admin/users"
              className="rounded-2xl bg-white/5 p-5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition block group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">User Directory</span>
                <span className="text-xs text-[#6366F1] font-semibold group-hover:translate-x-1 transition-transform inline-block">Manage →</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Review client, freelancer, and admin user profiles.</p>
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">Security Note</h2>
          <p className="mt-4 text-xs text-gray-400 leading-relaxed">
            Admin operations are protected via JWT authentication and role validation. Token cookies are verified on every request.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
