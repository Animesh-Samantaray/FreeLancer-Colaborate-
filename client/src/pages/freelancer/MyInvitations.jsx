import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiCheck,
  FiX,
  FiUser,
  FiDollarSign,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { getMyInvitationsApi, updateInvitationStatusApi } from "../../api/apiServices";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Button from "../../components/Button";
import { useProfile } from "../../context/ProfileContext";

const MyInvitations = () => {
  const { refetchProfile } = useProfile();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchMyInvitations = async () => {
    try {
      setLoading(true);
      const data = await getMyInvitationsApi();
      setInvitations(data.invitations || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not fetch your invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyInvitations();
  }, []);

  const handleResponse = async (id, status) => {
    try {
      setActionLoadingId(id);
      const res = await updateInvitationStatusApi(id, status);
      toast.success(res.message || `Invitation ${status.toLowerCase()} successfully.`);
      await refetchProfile();
      // Refresh list
      fetchMyInvitations();
    } catch (err) {
      console.error("Invitation update error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your invitations..." />;
  }

  if (error) {
    return <EmptyState title="Unable to load invitations" description={error} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#3B82F6]">
          Freelancer Workspace
        </span>
        <h1 className="text-3xl font-bold text-white font-display">Client Invitations</h1>
        <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
          Review direct private project invitations sent to you by verified clients.
        </p>
      </div>

      {invitations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {invitations.map((inv) => {
            const project = inv.project || {};
            const client = inv.client || {};
            const isPending = inv.status === "Pending";

            return (
              <div
                key={inv._id}
                className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition duration-300 space-y-5"
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

                    <span className="text-xs text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Project Title & Client */}
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {project.title || "Private Project"}
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
                        <span>From: {client.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* Project Metrics */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Project Budget</span>
                      <span className="text-sm font-bold text-emerald-400">
                        ${project.budget || "—"}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <span className="text-gray-400 block mb-1">Visibility</span>
                      <span className="text-sm font-bold text-white uppercase text-[10px] tracking-wider">
                        {project.visibility || "Private"}
                      </span>
                    </div>
                  </div>

                  {/* Client Message */}
                  {inv.message && (
                    <div className="mt-4">
                      <h4 className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                        Client Message
                      </h4>
                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5">
                        {inv.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {isPending ? (
                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      loading={actionLoadingId === inv._id}
                      icon={<FiX />}
                      onClick={() => handleResponse(inv._id, "Rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      loading={actionLoadingId === inv._id}
                      icon={<FiCheck />}
                      onClick={() => handleResponse(inv._id, "Accepted")}
                    >
                      Accept
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
                    <span>Responded</span>
                    {project._id && (
                      <Link
                        to={`/freelancer/project/${project._id}`}
                        className="text-[#3B82F6] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>View Project</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No invitations received"
          description="You currently have no project invitations from clients. Ensure your profile is updated to attract client invites."
        />
      )}
    </div>
  );
};

export default MyInvitations;
