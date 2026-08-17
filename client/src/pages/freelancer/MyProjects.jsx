import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFolder,
  FiClock,
  FiArrowRight,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiCheckSquare,
  FiMessageSquare,
} from "react-icons/fi";
import { getMyProjectsApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import MilestonesSection from "../../components/MilestonesSection";

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // Milestones modal state
  const [milestonesModalOpen, setMilestonesModalOpen] = useState(false);
  const [milestonesProject, setMilestonesProject] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyProjectsApi();
      setProjects(response.projects || []);
    } catch (err) {
      console.error("Fetch freelancer projects error:", err);
      setError(err?.response?.data?.message || "Unable to load your projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const ongoingStatuses = ["Open", "Hiring", "Hired", "In Progress"];

  const filteredProjects = projects.filter((project) => {
    if (activeTab === "All") return true;
    if (activeTab === "Ongoing") {
      return ongoingStatuses.includes(project.status);
    }
    if (activeTab === "Completed") {
      return project.status === "Completed";
    }
    if (activeTab === "Cancelled") {
      return project.status === "Cancelled";
    }
    return project.status === activeTab;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "In Progress":
      case "Hired":
      case "Hiring":
        return "bg-indigo-500/10 border-indigo-500/20 text-[#6366F1]";
      case "Cancelled":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      default:
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading projects..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load your projects. Please try again." description={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Card */}
      <div className="glass-card border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
              Freelancer Workspace
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white font-display">My Projects</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Track and manage all projects assigned to you by clients. Monitor deliverables, track milestones, and collaborate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-gray-300">
              Total: {projects.length}
            </span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-6">
          {["All", "Ongoing", "Completed", "Cancelled"].map((tab) => {
            const isActive = activeTab === tab;
            let count = 0;
            if (tab === "All") count = projects.length;
            else if (tab === "Ongoing") count = projects.filter((p) => ongoingStatuses.includes(p.status)).length;
            else if (tab === "Completed") count = projects.filter((p) => p.status === "Completed").length;
            else if (tab === "Cancelled") count = projects.filter((p) => p.status === "Cancelled").length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-white/5 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="glass-card rounded-3xl border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#6366F1] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    {project.category || "General"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-[0.2em] border ${getStatusBadgeStyle(
                      project.status
                    )}`}
                  >
                    {project.status || "Open"}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white font-display line-clamp-1">{project.title}</h2>
                <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">{project.description}</p>

                {/* Client Information */}
                {project.client && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-300 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                    {project.client.avatar ? (
                      <img
                        src={project.client.avatar}
                        alt={project.client.fullName || "Client"}
                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center font-bold text-[10px]">
                        {project.client.fullName?.[0] || "C"}
                      </div>
                    )}
                    <span className="truncate">Client: <strong className="text-white">{project.client.fullName || "Verified Client"}</strong></span>
                  </div>
                )}

                {/* Required Skills */}
                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.requiredSkills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-white/5 border border-white/5 px-2.5 py-0.5 text-[10px] text-gray-300 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1 font-semibold text-white">
                    <FiDollarSign className="text-[#22C55E]" />
                    <span>Budget: ${project.budget}</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <FiClock className="text-amber-400" />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.createdAt && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 col-span-2">
                      <FiCalendar className="text-gray-500" />
                      <span>Assigned: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FiCheckSquare className="text-[#6366F1]" />}
                    onClick={() => {
                      setMilestonesProject(project);
                      setMilestonesModalOpen(true);
                    }}
                  >
                    Milestones
                  </Button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/messages/${project._id}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition"
                      title="Project Chat"
                    >
                      <FiMessageSquare className="w-4 h-4 text-[#6366F1]" />
                    </Link>

                    <Link
                      to={`/freelancer/project/${project._id}`}
                      className="text-xs font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-3.5 py-2 rounded-2xl hover:brightness-110 transition flex items-center gap-1"
                    >
                      <span>View Project</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description="You don't have any assigned projects yet."
          action={
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition"
            >
              Browse Projects
            </Link>
          }
        />
      )}

      {/* Milestones Modal */}
      <Modal
        isOpen={milestonesModalOpen}
        onClose={() => setMilestonesModalOpen(false)}
        title={`Project Milestones - "${milestonesProject?.title || "Project"}"`}
        maxWidth="max-w-4xl"
      >
        {milestonesProject && (
          <MilestonesSection
            projectId={milestonesProject._id}
            project={milestonesProject}
          />
        )}
      </Modal>
    </div>
  );
};

export default MyProjects;
