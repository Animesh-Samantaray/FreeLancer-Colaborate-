import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiClock,
  FiDollarSign,
  FiArrowLeft,
  FiCheckCircle,
  FiUser,
  FiSend,
  FiLock,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { createProposalApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import { useProfile } from "../../context/ProfileContext";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proposal modal state
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/project/${id}`);
        const proj = response.data.project;
        setProject(proj);
        if (proj) {
          setBidAmount(proj.budget || "");
          setEstimatedDays("7");
        }
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load project details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProjectDetails();
  }, [id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      toast.error("Please enter a cover letter.");
      return;
    }
    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }
    if (!estimatedDays || Number(estimatedDays) <= 0) {
      toast.error("Please enter estimated completion days.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProposalApi({
        project: id,
        coverLetter: coverLetter.trim(),
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
      });
      toast.success(res.message || "Proposal submitted successfully!");
      await refetchProfile();
      setProposalModalOpen(false);
      setCoverLetter("");
    } catch (err) {
      console.error("Proposal submission error:", err);
    } finally {
      setSubmitting(false);
    }
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

  const isPrivate = project.visibility === "Private";

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

          {isPrivate ? (
            <span className="inline-flex items-center gap-2 rounded-3xl bg-amber-500/10 border border-amber-500/20 px-5 py-3 text-sm font-semibold text-amber-400">
              <FiLock className="w-4 h-4" />
              Private Project (Invitation Only)
            </span>
          ) : (
            <Button
              icon={<FiSend />}
              onClick={() => setProposalModalOpen(true)}
            >
              Submit Proposal
            </Button>
          )}
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

      {/* Submit Proposal Modal */}
      <Modal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        title={`Submit Proposal for "${project.title}"`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitProposal} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Bid Amount ($)
            </label>
            <input
              type="number"
              min="1"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="e.g. 500"
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Estimated Completion Days
            </label>
            <input
              type="number"
              min="1"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              placeholder="e.g. 7"
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Cover Letter
            </label>
            <textarea
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Detail your relevant experience, proposed methodology, and deliverable commitments..."
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setProposalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} icon={<FiSend />}>
              Submit Proposal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;

