import { useEffect, useState } from "react";
import {
  FiFolder,
  FiClock,
  FiChevronRight,
  FiFileText,
  FiMail,
  FiCheck,
  FiX,
  FiTrash2,
  FiUser,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import {
  getProjectProposalsApi,
  updateProposalStatusApi,
  getProjectInvitationsApi,
  deleteInvitationApi,
} from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import { Link } from "react-router-dom";

const MyProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proposals modal state
  const [proposalsModalOpen, setProposalsModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Invitations modal state
  const [invitationsModalOpen, setInvitationsModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/project");
      setProjects(response.data.projects || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch Proposals for a Public project
  const handleOpenProposals = async (project) => {
    setActiveProject(project);
    setProposalsModalOpen(true);
    try {
      setProposalsLoading(true);
      const res = await getProjectProposalsApi(project._id);
      setProposals(res.proposals || []);
    } catch (err) {
      console.error("Fetch proposals error:", err);
    } finally {
      setProposalsLoading(false);
    }
  };

  // Accept / Reject proposal
  const handleUpdateProposalStatus = async (proposalId, status) => {
    try {
      setActionLoadingId(proposalId);
      const res = await updateProposalStatusApi(proposalId, status);
      toast.success(res.message || `Proposal ${status.toLowerCase()} successfully.`);
      // Refresh proposals list
      const updated = await getProjectProposalsApi(activeProject._id);
      setProposals(updated.proposals || []);
      // Refresh main projects list to update project status if accepted
      fetchProjects();
    } catch (err) {
      console.error("Update proposal error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Fetch Invitations for a Private project
  const handleOpenInvitations = async (project) => {
    setActiveProject(project);
    setInvitationsModalOpen(true);
    try {
      setInvitationsLoading(true);
      const res = await getProjectInvitationsApi(project._id);
      setInvitations(res.invitations || []);
    } catch (err) {
      console.error("Fetch invitations error:", err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  // Delete/Withdraw invitation
  const handleDeleteInvitation = async (invitationId) => {
    try {
      setActionLoadingId(invitationId);
      const res = await deleteInvitationApi(invitationId);
      toast.success(res.message || "Invitation withdrawn successfully.");
      setInvitations((prev) => prev.filter((i) => i._id !== invitationId));
    } catch (err) {
      console.error("Delete invitation error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your projects..." />;
  }

  if (error) {
    return <EmptyState title="Error loading projects" description={error} />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card border border-white/10 rounded-3xl p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#6366F1]">My Projects</p>
            <h1 className="mt-3 text-3xl font-bold text-white">All projects you have created</h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl">
              View project details, deadlines, proposals, and invitations from a single client workspace.
            </p>
          </div>
          <Link
            to="/client/create-project"
            className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/20 hover:brightness-110 transition"
          >
            <FiFolder className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {projects.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {projects.map((project) => {
            const isPublic = project.visibility !== "Private";

            return (
              <div
                key={project._id}
                className="glass-card border border-white/10 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{project.title}</h3>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{project.description}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-gray-300 font-semibold shrink-0">
                      {project.status || "Open"}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Category</p>
                      <p className="mt-2 text-sm font-semibold text-white">{project.category || "General"}</p>
                    </div>
                    <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Budget</p>
                      <p className="mt-2 text-sm font-semibold text-emerald-400">${project.budget}</p>
                    </div>
                    <div className="rounded-3xl bg-white/5 px-4 py-3 text-gray-300">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Deadline</p>
                      <p className="mt-2 text-sm text-white">
                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3 text-sm">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-400">
                    <FiClock className="w-4 h-4 text-[#6366F1]" />
                    <span className="font-semibold text-gray-300">{project.visibility || "Public"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPublic ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FiFileText />}
                        onClick={() => handleOpenProposals(project)}
                      >
                        View Proposals
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FiMail />}
                        onClick={() => handleOpenInvitations(project)}
                      >
                        View Invitations
                      </Button>
                    )}

                    <Link
                      to={`/client/create-project?edit=${project._id}`}
                      className="text-xs font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-1 bg-white/5 px-3 py-2 rounded-2xl border border-white/10"
                    >
                      <span>Edit</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="You have no active projects"
          description="Create a new project and start collecting proposals from top freelancers."
          action={
            <Link
              to="/client/create-project"
              className="rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white"
            >
              Add your first project
            </Link>
          }
        />
      )}

      {/* Proposals Modal */}
      <Modal
        isOpen={proposalsModalOpen}
        onClose={() => setProposalsModalOpen(false)}
        title={`Proposals for "${activeProject?.title || "Project"}"`}
        maxWidth="max-w-3xl"
      >
        {proposalsLoading ? (
          <LoadingSpinner label="Loading proposals..." />
        ) : proposals.length > 0 ? (
          <div className="space-y-4">
            {proposals.map((prop) => {
              const freelancerName = prop.freelancer?.fullName || "Freelancer";
              const freelancerAvatar = prop.freelancer?.avatar;
              const isPending = prop.status === "Pending";

              return (
                <div
                  key={prop._id}
                  className="p-5 rounded-3xl border border-white/10 bg-white/5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          freelancerAvatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                        }
                        alt={freelancerName}
                        className="w-10 h-10 rounded-2xl object-cover border border-white/10 bg-[#09090B]"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{freelancerName}</h4>
                        <p className="text-xs text-gray-400">{prop.freelancer?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${
                          prop.status === "Accepted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : prop.status === "Rejected"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Bid Amount</span>
                      <span className="text-sm font-bold text-emerald-400">${prop.bidAmount}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Estimated Time</span>
                      <span className="text-sm font-bold text-white">{prop.estimatedDays} Days</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs uppercase font-semibold text-gray-400 mb-1">Cover Letter</h5>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-2xl border border-white/5">
                      {prop.coverLetter}
                    </p>
                  </div>

                  {isPending && (
                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={actionLoadingId === prop._id}
                        icon={<FiX />}
                        onClick={() => handleUpdateProposalStatus(prop._id, "Rejected")}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={actionLoadingId === prop._id}
                        icon={<FiCheck />}
                        onClick={() => handleUpdateProposalStatus(prop._id, "Accepted")}
                      >
                        Accept Proposal
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No proposals received yet"
            description="Freelancers haven't submitted proposals for this project yet."
          />
        )}
      </Modal>

      {/* Invitations Modal */}
      <Modal
        isOpen={invitationsModalOpen}
        onClose={() => setInvitationsModalOpen(false)}
        title={`Invitations for "${activeProject?.title || "Project"}"`}
        maxWidth="max-w-3xl"
      >
        {invitationsLoading ? (
          <LoadingSpinner label="Loading invitations..." />
        ) : invitations.length > 0 ? (
          <div className="space-y-4">
            {invitations.map((inv) => {
              const freelancerName = inv.freelancer?.fullName || "Freelancer";
              const freelancerAvatar = inv.freelancer?.avatar;

              return (
                <div
                  key={inv._id}
                  className="p-5 rounded-3xl border border-white/10 bg-white/5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          freelancerAvatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                        }
                        alt={freelancerName}
                        className="w-10 h-10 rounded-2xl object-cover border border-white/10 bg-[#09090B]"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{freelancerName}</h4>
                        <p className="text-xs text-gray-400">{inv.freelancer?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${
                          inv.status === "Accepted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : inv.status === "Rejected"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  {inv.message && (
                    <div>
                      <h5 className="text-xs uppercase font-semibold text-gray-400 mb-1">Message Sent</h5>
                      <p className="text-xs text-gray-300 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5">
                        {inv.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span>Sent: {new Date(inv.createdAt).toLocaleDateString()}</span>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      loading={actionLoadingId === inv._id}
                      icon={<FiTrash2 />}
                      onClick={() => handleDeleteInvitation(inv._id)}
                    >
                      Withdraw Invitation
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No invitations sent"
            description="You have not sent invitations to any freelancers for this private project yet."
          />
        )}
      </Modal>
    </div>
  );
};

export default MyProject;

