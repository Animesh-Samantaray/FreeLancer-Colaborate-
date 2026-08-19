import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiDollarSign,
  FiActivity,
  FiSearch,
  FiUser,
  FiFolder,
  FiArrowRight,
  FiFileText,
  FiMail,
  FiStar,
  FiClock,
  FiBriefcase,
  FiCode,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../api/axios";
import { getMyProposalsApi, getMyInvitationsApi } from "../../api/apiServices";
import { useProfile } from "../../context/ProfileContext";
import StatsCard from "../../components/StatsCard";
import GlassCard from "../../components/GlassCard";
import SkillBadge from "../../components/SkillBadge";
import Button from "../../components/Button";
import SkeletonLoader from "../../components/SkeletonLoader";

function Dashboard() {
  const { profile, loading: profileLoading, error: profileError, refetchProfile } = useProfile();
  const [projects, setProjects] = useState([]);
  const [proposalCount, setProposalCount] = useState(0);
  const [invitationCount, setInvitationCount] = useState(0);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        setProjectsLoading(true);
        const [projectsRes, proposalsRes, invitationsRes] = await Promise.allSettled([
          api.get("/project"),
          getMyProposalsApi(),
          getMyInvitationsApi(),
        ]);

        if (projectsRes.status === "fulfilled" && projectsRes.value.data?.projects) {
          setProjects(projectsRes.value.data.projects);
        }

        if (proposalsRes.status === "fulfilled" && proposalsRes.value?.proposals) {
          setProposalCount(proposalsRes.value.proposals.length);
        }

        if (invitationsRes.status === "fulfilled" && invitationsRes.value?.invitations) {
          setInvitationCount(invitationsRes.value.invitations.length);
        }
      } catch (err) {
        console.error("Freelancer dashboard error:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchFreelancerData();
  }, []);

  if (profileLoading && !profile) {
    return <SkeletonLoader type="profile" />;
  }

  // Display statistics strictly from backend profile object without client calculations
  const completedProjects = profile?.completedProjects ?? 0;
  const ongoingProjects = profile?.ongoingProjects ?? 0;
  const availability = profile?.availability || "Available";
  const hourlyRate = profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : "$0/hr";
  const ratingDisplay = profile?.averageRating ? `${profile.averageRating.toFixed(1)} / 5` : "N/A";
  const experienceYears = profile?.experience ? `${profile.experience} Yrs` : "0 Yrs";
  const skillsList = profile?.skills || [];

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
              {profile?.professionalTitle || "Professional Freelancer"} · Track project progress, client invitations, and availability status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/freelancer/my-projects">
              <Button variant="secondary" icon={<FiFolder />}>My Projects</Button>
            </Link>
            <Link to="/freelancer/my-proposals">
              <Button variant="secondary" icon={<FiFileText />}>My Proposals ({proposalCount})</Button>
            </Link>
            <Link to="/freelancer/my-invitations">
              <Button variant="secondary" icon={<FiMail />}>Invitations ({invitationCount})</Button>
            </Link>
            <Link to="/freelancer/browse-projects">
              <Button icon={<FiSearch />}>Browse Projects</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Statistics Cards - Strictly fetched from Backend Freelancer Profile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
          subtitle="Currently in development"
          icon={<FiActivity className="w-5 h-5" />}
          accent="from-[#3B82F6] to-[#6366F1]"
        />
        <StatsCard
          title="Availability"
          value={availability}
          subtitle={availability === "Available" ? "Ready for new projects" : "Currently occupied"}
          icon={<FiClock className="w-5 h-5" />}
          accent={availability === "Available" ? "from-emerald-500 to-green-600" : "from-amber-500 to-orange-600"}
        />
        <StatsCard
          title="Hourly Rate"
          value={hourlyRate}
          subtitle="Base billing rate"
          icon={<FiDollarSign className="w-5 h-5" />}
          accent="from-purple-500 to-indigo-600"
        />
        <StatsCard
          title="Rating"
          value={ratingDisplay}
          subtitle={`${profile?.totalReviews ?? 0} client reviews`}
          icon={<FiStar className="w-5 h-5" />}
          accent="from-yellow-400 to-amber-500"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Available Projects & Skills Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills & Experience Info Box */}
          <GlassCard hover={false} className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white font-display">Professional Skills & Experience</h2>
                <p className="text-xs text-gray-400">Maintained directly on your profile</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white">
                <FiBriefcase className="w-4 h-4 text-[#3B82F6]" />
                <span>Experience: {experienceYears}</span>
              </div>
            </div>

            {skillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, index) => (
                  <SkillBadge key={index} label={skill} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No skills listed yet. Add skills in your profile.</p>
            )}
          </GlassCard>

          {/* Recommended Open Projects */}
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
              {projectsLoading ? (
                <div className="py-8 text-center text-xs text-gray-400">Loading available projects...</div>
              ) : projects.length > 0 ? (
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

        {/* Right Side: Quick Navigation */}
        <div className="space-y-6">
          <GlassCard hover={false} className="p-6">
            <h2 className="text-lg font-bold text-white font-display mb-2">Quick Navigation</h2>
            <p className="text-xs text-gray-400 mb-6">Manage your proposal & invitation pipelines</p>

            <div className="space-y-3">
              <Link
                to="/freelancer/my-projects"
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                    <FiFolder className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#6366F1] transition">
                      My Projects
                    </h4>
                    <p className="text-xs text-gray-400">View assigned projects & milestones</p>
                  </div>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/freelancer/my-proposals"
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366F1]">
                    <FiFileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#6366F1] transition">
                      My Proposals
                    </h4>
                    <p className="text-xs text-gray-400">{proposalCount} proposals submitted</p>
                  </div>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                to="/freelancer/my-invitations"
                className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                      Client Invitations
                    </h4>
                    <p className="text-xs text-gray-400">{invitationCount} invitations received</p>
                  </div>
                </div>
                <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
              <Link to="/freelancer/profile" className="block">
                <Button variant="secondary" className="w-full" icon={<FiUser />}>
                  Edit / View Public Profile
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
