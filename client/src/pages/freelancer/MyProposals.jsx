import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiFileText,
  FiDollarSign,
  FiClock,
  FiTrash2,
  FiUser,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { getMyProposalsApi, deleteProposalApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";

const MyProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchMyProposals = async () => {
    try {
      setLoading(true);
      const data = await getMyProposalsApi();
      setProposals(data.proposals || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not fetch your proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProposals();
  }, []);

  const handleWithdrawProposal = async (id) => {
    try {
      setActionLoadingId(id);
      const res = await deleteProposalApi(id);
      toast.success(res.message || "Proposal withdrawn successfully.");
      setProposals((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Withdraw proposal error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your proposals..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load proposals" description={error} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1]">
          Freelancer Workspace
        </span>
        <h1 className="text-3xl font-bold text-white font-display">My Submitted Proposals</h1>
        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
          Track the status of your submitted bids, review project terms, and manage active proposals.
        </p>
      </div>

      {proposals.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {proposals.map((prop) => {
            const project = prop.project || {};
            const client = prop.client || {};
            const isPending = prop.status === "Pending";

            return (
              <div
                key={prop._id}
                className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition duration-300 space-y-5"
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

                    <span className="text-xs text-gray-400">
                      {new Date(prop.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Project Title & Client */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {project.title || "Project"}
                    </h3>

                    {client.fullName && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <img
                          src={
                            client.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                          }
                          alt={client.fullName}
                          className="w-5 h-5 rounded-full object-cover border border-white/10"
                        />
                        <span>Client: {client.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Proposal Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Your Bid</span>
                      <span className="text-sm font-bold text-emerald-400">${prop.bidAmount}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Est. Completion</span>
                      <span className="text-sm font-bold text-white">{prop.estimatedDays} Days</span>
                    </div>
                  </div>

                  {/* Cover Letter excerpt */}
                  <div className="mt-4">
                    <h4 className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                      Cover Letter
                    </h4>
                    <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5">
                      {prop.coverLetter}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {project._id ? (
                    <Link
                      to={`/freelancer/project/${project._id}`}
                      className="text-xs font-semibold text-[#6366F1] hover:text-[#3B82F6] transition flex items-center gap-1"
                    >
                      <span>View Brief</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-500">Project details unavailable</span>
                  )}

                  {isPending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      loading={actionLoadingId === prop._id}
                      icon={<FiTrash2 />}
                      onClick={() => handleWithdrawProposal(prop._id)}
                    >
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No proposals submitted yet"
          description="You haven't submitted proposals for any client projects. Explore open requests in the marketplace."
          action={
            <Link
              to="/freelancer/browse-projects"
              className="inline-flex items-center gap-2 rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#3B82F6] px-6 py-3 text-sm font-semibold text-white"
            >
              Browse Projects
            </Link>
          }
        />
      )}
    </div>
  );
};

export default MyProposals;
