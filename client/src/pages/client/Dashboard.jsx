import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFolder,
  FiActivity,
  FiCheckCircle,
  FiPlus,
  FiUsers,
  FiUser,
  FiArrowRight,
  FiEye,
  FiStar,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../api/axios";
import { useProfile } from "../../context/ProfileContext";
import StatsCard from "../../components/StatsCard";
import GlassCard from "../../components/GlassCard";
import Button from "../../components/Button";
import SkeletonLoader from "../../components/SkeletonLoader";

function Dashboard() {
  const { profile, loading: profileLoading, error: profileError, refetchProfile } = useProfile();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        setProjectsLoading(true);
        const projectsRes = await api.get("/project");
        if (projectsRes.data?.projects) {
          setProjects(projectsRes.data.projects);
        }
      } catch (err) {
        console.error("Fetch projects error:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  if (profileLoading && !profile) {
    return <SkeletonLoader type="profile" />;
  }

  // Display values strictly from backend profile object without client-side calculations
  const totalProjects = profile?.totalProjects ?? 0;
  const activeProjects = profile?.activeProjects ?? 0;
  const completedProjects = profile?.completedProjects ?? 0;
  const totalHires = profile?.totalHires ?? 0;
  const ratingDisplay = profile?.averageRating ? `${profile.averageRating.toFixed(1)} / 5` : "N/A";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Error Alert if API fetch fails */}
      {profileError && (
        <div className="glass-card border border-red-500/20 bg-red-500/10 p-4 rounded-2xl flex items-center justify-between gap-4 text-red-200">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm">{profileError}</p>
          </div>
          <Button variant="secondary" size="sm" icon={<FiRefreshCw />} onClick={refetchProfile}>
            Retry
          </Button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#6366F1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
              Client Overview
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white font-display">
              Welcome back, {profile?.companyName || "Client"}
            </h1>
            <p className="mt-2 text-sm text-gray-400 max-w-xl">
              Track project milestones, monitor hiring statistics, and collaborate with top-tier talent from your workspace.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/client/create-project">
              <Button icon={<FiPlus />}>Create Project</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards - Strictly fetched from Backend Profile API */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          subtitle="All projects created"
          icon={<FiFolder className="w-5 h-5" />}
          accent="from-[#6366F1] to-[#3B82F6]"
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          subtitle="Currently open / hiring"
          icon={<FiActivity className="w-5 h-5" />}
          accent="from-[#3B82F6] to-[#8B5CF6]"
        />
        <StatsCard
          title="Completed Projects"
          value={completedProjects}
          subtitle="Finalized & delivered"
          icon={<FiCheckCircle className="w-5 h-5" />}
          accent="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Freelancers Hired"
          value={totalHires}
          subtitle="Total hires made"
          icon={<FiUsers className="w-5 h-5" />}
          accent="from-amber-500 to-orange-600"
        />
        <StatsCard
          title="Rating"
          value={ratingDisplay}
          subtitle={`${profile?.totalReviews ?? 0} total reviews`}
          icon={<FiStar className="w-5 h-5" />}
          accent="from-yellow-400 to-amber-500"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Projects Table (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard hover={false} className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Recent Projects</h2>
                <p className="text-xs text-gray-400">Overview of your recent active postings</p>
              </div>
              <Link
                to="/client/my-projects"
                className="text-xs font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-1"
              >
                <span>View All</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {projectsLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">Loading recent projects...</div>
            ) : projects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 px-2">Project</th>
                      <th className="pb-3 px-2">Category</th>
                      <th className="pb-3 px-2">Budget</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projects.slice(0, 5).map((project) => (
                      <tr key={project._id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-2 font-medium text-white max-w-[200px] truncate">
                          {project.title}
                        </td>
                        <td className="py-4 px-2 text-gray-400 text-xs">
                          {project.category || "General"}
                        </td>
                        <td className="py-4 px-2 text-white font-semibold">
                          ${project.budget}
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                              project.status === "Completed"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : project.status === "In Progress" || project.status === "Hired"
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            }`}
                          >
                            {project.status || "Open"}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <Link
                            to="/client/my-projects"
                            className="inline-flex items-center gap-1 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition text-xs font-medium"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <FiFolder className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-300">No projects found</p>
                <p className="text-xs text-gray-500 mt-1">Start by posting your first project.</p>
                <Link to="/client/create-project" className="inline-block mt-4">
                  <Button variant="secondary" icon={<FiPlus />}>
                    Create Project
                  </Button>
                </Link>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Quick Actions Card */}
        <div className="space-y-6">
          <GlassCard hover={false} className="p-6">
            <h2 className="text-lg font-bold text-white font-display mb-2">Quick Actions</h2>
            <p className="text-xs text-gray-400 mb-6">Shortcuts to manage your account and team</p>

            <div className="space-y-3">
              <Link to="/client/create-project" className="block">
                <div className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#6366F1]/40 hover:bg-[#6366F1]/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                      <FiPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Post New Project</p>
                      <p className="text-xs text-gray-400">Hire freelancers for new work</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition text-[#6366F1]" />
                </div>
              </Link>

              <Link to="/client/freelancers" className="block">
                <div className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                      <FiUsers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Browse Freelancers</p>
                      <p className="text-xs text-gray-400">Explore talented professionals</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition text-[#3B82F6]" />
                </div>
              </Link>

              <Link to="/client/profile" className="block">
                <div className="group flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-purple-500/10 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Company Profile</p>
                      <p className="text-xs text-gray-400">Update company info & logo</p>
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition text-purple-400" />
                </div>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
