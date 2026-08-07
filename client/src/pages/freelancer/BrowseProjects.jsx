import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiSearch,
  FiDollarSign,
  FiClock,
  FiUser,
  FiLock,
  FiSend,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { createProposalApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";

const BrowseProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Proposal modal state
  const [selectedProject, setSelectedProject] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/project?type=browse");
        setProjects(response.data.projects || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleOpenProposalModal = (project) => {
    setSelectedProject(project);
    setBidAmount(project.budget || "");
    setCoverLetter("");
    setEstimatedDays("7");
  };

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
      toast.error("Please enter estimated days.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createProposalApi({
        project: selectedProject._id,
        coverLetter: coverLetter.trim(),
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays),
      });
      toast.success(res.message || "Proposal submitted successfully!");
      setSelectedProject(null);
    } catch (err) {
      console.error("Proposal error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (project.visibility === "Private") return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = project.title?.toLowerCase().includes(query);
    const categoryMatch = project.category?.toLowerCase().includes(query);
    const skillsMatch = project.requiredSkills?.some((s) => s.toLowerCase().includes(query));
    return titleMatch || categoryMatch || skillsMatch;
  });

  if (loading) {
    return <LoadingSpinner label="Fetching available projects..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load marketplace" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">Freelancer Marketplace</p>
            <h1 className="mt-3 text-3xl font-bold text-white font-display">Explore active client requests</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Browse real client projects, view budget terms, and apply directly to opportunities that fit your expertise.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search title or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full rounded-3xl border border-white/10 bg-transparent px-11 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const isPrivate = project.visibility === "Private";

            return (
              <div
                key={project._id}
                className="glass-card rounded-3xl border border-white/10 p-6 hover:border-white/20 hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#6366F1] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {project.category || "General"}
                    </span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-300">
                      {project.status || "Open"}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-white font-display line-clamp-1">{project.title}</h2>
                  <p className="mt-2 text-xs text-gray-400 line-clamp-3 leading-relaxed">{project.description}</p>

                  {project.client && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                      <FiUser className="text-[#6366F1]" />
                      <span>Client: {project.client.fullName || "Verified Client"}</span>
                    </div>
                  )}

                  {project.requiredSkills && project.requiredSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] text-gray-300 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1 font-semibold text-white">
                      <FiDollarSign className="text-[#22C55E]" />
                      <span>Budget: ${project.budget}</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <FiClock />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/freelancer/project/${project._id}`}
                      className="text-xs font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-1.5"
                    >
                      <span>View Brief</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {isPrivate ? (
                      <span className="inline-flex items-center gap-1.5 rounded-3xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 text-xs font-semibold text-amber-400">
                        <FiLock className="w-3.5 h-3.5" />
                        Private Project
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        icon={<FiSend />}
                        onClick={() => handleOpenProposalModal(project)}
                      >
                        Submit Proposal
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No projects found"
          description={
            searchQuery
              ? `No active projects matched your search term "${searchQuery}".`
              : "There are currently no active projects posted by clients."
          }
        />
      )}

      {/* Submit Proposal Modal */}
      <Modal
        isOpen={Boolean(selectedProject)}
        onClose={() => setSelectedProject(null)}
        title={`Submit Proposal for "${selectedProject?.title || ""}"`}
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
              onClick={() => setSelectedProject(null)}
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

export default BrowseProjects;

