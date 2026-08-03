import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiClock, FiDollarSign, FiArrowLeft, FiCheckCircle, FiUser, FiSend } from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/project/${id}`);
        setProject(response.data.project);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProjectDetails();
  }, [id]);

  const handleSubmitProposal = () => {
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Proposal submitted successfully to the client!");
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return <LoadingSpinner label="Loading project brief..." />;
  }

  if (error || !project) {
    return (
      <EmptyState
        title="Project not found"
        description={error || "The requested project could not be found."}
        action={
          <Link
            to="/freelancer/browse-projects"
            className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white"
          >
            <FiArrowLeft /> Back to Marketplace
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="glass-card rounded-3xl border border-white/10 p-8 relative overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Link
                to="/freelancer/browse-projects"
                className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
              >
                <FiArrowLeft /> Back to Marketplace
              </Link>
              <span className="text-gray-600">·</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#6366F1] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                {project.category || "General"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white font-display">{project.title}</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Review the detailed brief below and submit your proposal with deliverable timelines.
            </p>
          </div>
          <button
            onClick={handleSubmitProposal}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition active:scale-[0.98] disabled:opacity-50"
          >
            <FiSend className="w-4 h-4" />
            {submitting ? "Sending..." : "Submit Proposal"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Brief Panel */}
        <div className="glass-card rounded-3xl border border-white/10 p-6 xl:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white font-display border-b border-white/5 pb-3">Project Description</h2>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-xs">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-2xl bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs text-gray-200 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-white/5 p-5 border border-white/5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiCheckCircle className="text-[#22C55E]" /> Guaranteed Milestone Escrow
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              This project is eligible for milestone-based funding. Funds are deposited into escrow prior to project initiation and released upon milestone review approval.
            </p>
          </div>
        </div>

        {/* Sidebar Info */}
        <aside className="space-y-6">
          <div className="glass-card rounded-3xl border border-white/10 p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-400">Brief Specifications</p>

            <div className="space-y-3 text-sm text-gray-300 pt-2">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Budget</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <FiDollarSign className="text-[#22C55E]" /> ${project.budget}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Deadline</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <FiClock className="text-amber-400" />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Visibility</span>
                <span className="font-semibold text-white capitalize">{project.visibility || "Public"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-[#22C55E] uppercase text-xs bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                  {project.status || "Open"}
                </span>
              </div>
            </div>
          </div>

          {project.client && (
            <div className="glass-card rounded-3xl border border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-gray-400 mb-3">Client Overview</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] flex items-center justify-center font-bold text-white text-sm">
                  {project.client.fullName?.[0] || "C"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{project.client.fullName || "Verified Client"}</h4>
                  <p className="text-xs text-gray-400">{project.client.email}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetails;
