import { useMemo } from "react";
import { FiBriefcase, FiTrendingUp, FiDollarSign, FiStar, FiSearch, FiCheckCircle, FiMessageSquare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const FreelancerDashboard = () => {
  const { user } = useAuth();

  const stats = useMemo(
    () => [
      { label: "Active Bids", value: "14", icon: FiBriefcase, accent: "from-[#6366F1] to-[#3B82F6]" },
      { label: "Avg. Response Time", value: "2.4h", icon: FiTrendingUp, accent: "from-[#22C55E] to-[#10B981]" },
      { label: "Total Earnings", value: "$24,750", icon: FiDollarSign, accent: "from-[#F59E0B] to-[#F97316]" },
      { label: "Client Rating", value: "4.9", icon: FiStar, accent: "from-[#8B5CF6] to-[#6366F1]" },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 rounded-3xl p-8 overflow-hidden">
        <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#6366F1]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6366F1]">Freelancer Dashboard</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Welcome back, {user?.fullName?.split(" ")[0] || "Partner"}</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl">
              Track proposals, monitor active engagements, and discover premium clients from your dashboard.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition"
            >
              Browse Projects
            </Link>
            <button className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Invite Client
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item) => (
          <div key={item.label} className="glass-card rounded-3xl border border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
                <h2 className="mt-4 text-3xl font-bold text-white">{item.value}</h2>
              </div>
              <div className={`rounded-3xl bg-gradient-to-br ${item.accent} p-4 text-white`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="glass-card rounded-3xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white">Suggested Roles</h2>
          <p className="mt-2 text-sm text-gray-400">Projects tailored for your skills and preferred budget range.</p>
          <div className="mt-6 space-y-4">
            {[
              { title: "Product Design Sprint", budget: "$4,200", status: "Open" },
              { title: "Full-stack React App", budget: "$8,900", status: "Hiring" },
              { title: "AI Chatbot Prototype", budget: "$6,300", status: "Open" },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/5 p-4 border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.budget}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gray-300">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl border border-white/10 p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Latest Activity</h2>
              <p className="mt-2 text-sm text-gray-400">Recent responses and follow-up reminders for active clients.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-gray-400">Live</span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { title: "Messaging with Lexi Studio", note: "Client asked for a revision on UI interactions.", time: "2m ago" },
              { title: "Proposal accepted for Design System", note: "Awaiting contract approval.", time: "1h ago" },
              { title: "New invite from FinTech team", note: "Budget confirmed at $5,400.", time: "Today" },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/5 p-4 border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{item.note}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Start your next proposal</h2>
          <p className="mt-2 text-sm text-gray-400">Browse the latest client requests and send the work plan in minutes.</p>
        </div>
        <Link
          to="/freelancer/browse-projects"
          className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition"
        >
          Browse all opportunities
        </Link>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
