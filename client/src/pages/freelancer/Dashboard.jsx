import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiActivity,
  FiSearch,
  FiUser,
  FiFolder,
  FiArrowRight,
  FiBriefcase,
} from "react-icons/fi";
import api from "../../api/axios";
import StatsCard from "../../components/StatsCard";
import GlassCard from "../../components/GlassCard";
import Button from "../../components/Button";
import SkeletonLoader from "../../components/SkeletonLoader";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancerDashboard = async () => {
      try {
        setLoading(true);
        const [profileRes, projectsRes] = await Promise.allSettled([
          api.get("/freelancer/profile"),
          api.get("/project"),
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value.data?.freelancer) {
          setProfile(profileRes.value.data.freelancer);
        }

        if (projectsRes.status === "fulfilled" && projectsRes.value.data?.projects) {
          setProjects(projectsRes.value.data.projects);
        }
      } catch (err) {
        console.error("Freelancer dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerDashboard();
  }, []);

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  const completedProjects = profile?.completedProjects ?? 0;
  const ongoingProjects = profile?.ongoingProjects ?? 0;
  const hoursWorked = profile?.totalHoursWorked ?? 0;
  const totalEarnings = profile?.totalEarnings ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#3B82F6]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#3B82F6]">
              Freelancer Workspace
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white font-display">
              Welcome back, {profile?.user?.fullName || "Freelancer"}
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              {profile?.professionalTitle || "Professional Freelancer"} · Keep track of active jobs, earnings, and client proposals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/freelancer/browse-projects">
              <Button icon={<FiSearch />}>Browse Projects</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatsCard
          title="Completed Projects"
          value={completedProjects}
          subtitle="Delivered to clients"
          icon={<FiCheckCircle className="w-5 h-5" />}
          accent="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Ongoing Projects"
          value={ongoingProjects}
          subtitle="Currently active work"
          icon={<FiActivity className="w-5 h-5" />}
          accent="from-[#6366F1] to-[#3B82F6]"
        />
        <StatsCard
          title="Hours Worked"
          value={`${hoursWorked} hrs`}
          subtitle="Total logged billable time"
          icon={<FiClock className="w-5 h-5" />}
          accent="from-[#3B82F6] to-[#8B5CF6]"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          subtitle="Gross earnings recorded"
          icon={<FiDollarSign className="w-5 h-5" />}
          accent="from-purple-500 to-indigo-600"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recommended Projects (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false} className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Available Projects</h2>
                <p className="text-xs text-gray-400">Recommended jobs open for proposals</p>
              </div>
              <Link
                to="/freelancer/browse-projects"
                className="text-xs font-semibold text-[#3B82F6] hover:text-[#6366F1] transition flex items-center gap-1"
              >
                <span>Explore All</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 4).map((project) => (
                  <div
                    key={project._id}
                    className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-white">{project.title}</h3>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        ${project.budget}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
                      <span>Category: {project.category || "General"}</span>
                      <Link
                        to={`/freelancer/project/${project._id}`}
                        className="text-[#3B82F6] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View Project</span>
                        <FiArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <FiFolder className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-300">No open projects right now.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="space-y-6">
          <GlassCard hover={false} className="p-6">
            <h2 className="text-lg font-bold text-white font-display mb-2">Recent Activity</h2>
            <p className="text-xs text-gray-400 mb-6">Latest milestones and updates</p>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#6366F1] ring-4 ring-[#09090B]" />
                <p className="text-xs font-semibold text-white">Profile Synchronized</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Your freelancer profile is live.</p>
                <span className="text-[10px] text-gray-500">Just now</span>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#3B82F6] ring-4 ring-[#09090B]" />
                <p className="text-xs font-semibold text-white">Browse Client Marketplace</p>
                <p className="text-[11px] text-gray-400 mt-0.5">New client requirements posted today.</p>
                <span className="text-[10px] text-gray-500">2 hours ago</span>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#09090B]" />
                <p className="text-xs font-semibold text-white">System Update</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Platform performance updated.</p>
                <span className="text-[10px] text-gray-500">1 day ago</span>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
              <Link to="/freelancer/profile" className="block">
                <Button variant="secondary" className="w-full" icon={<FiUser />}>
                  View Public Profile
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
