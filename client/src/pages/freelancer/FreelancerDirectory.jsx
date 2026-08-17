import { useEffect, useState } from "react";
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiEye,
  FiSend,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { createInvitationApi } from "../../api/apiServices";
import GlassCard from "../../components/GlassCard";
import SkillBadge from "../../components/SkillBadge";
import AvailabilityBadge from "../../components/AvailabilityBadge";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import PortfolioCard from "../../components/PortfolioCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import ReviewsSection from "../../components/ReviewsSection";

function FreelancerDirectory() {
  const { role } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Client Private Projects state for invitations
  const [privateProjects, setPrivateProjects] = useState([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null); // target freelancer
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/freelancer");
        if (res.data?.freelancers) {
          setFreelancers(res.data.freelancers);
        }

        // If client, fetch client's projects for invitations
        if (role === "client") {
          const projectRes = await api.get("/project");
          if (projectRes.data?.projects) {
            setPrivateProjects(projectRes.data.projects);
            if (projectRes.data.projects.length > 0) {
              setSelectedProjectId(projectRes.data.projects[0]._id);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching directory data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role]);

  const handleViewProfile = async (id) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/freelancer/${id}`, { params: { id } });
      if (res.data?.freelancer) {
        setSelectedFreelancer(res.data.freelancer);
      }
    } catch (err) {
      console.error("Error fetching freelancer details", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenInviteModal = (freelancer) => {
    if (privateProjects.length === 0) {
      toast.error("You don't have any projects to invite freelancers to.");
      return;
    }
    setInviteTarget(freelancer);
    if (!selectedProjectId && privateProjects.length > 0) {
      setSelectedProjectId(privateProjects[0]._id);
    }
    setInviteMessage("");
    setInviteModalOpen(true);
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      toast.error("Please select a project.");
      return;
    }
    const freelancerUserId = inviteTarget?.user?._id || inviteTarget?.user;
    if (!freelancerUserId) {
      toast.error("Invalid freelancer information.");
      return;
    }

    try {
      setInviting(true);
      const res = await createInvitationApi({
        project: selectedProjectId,
        freelancer: freelancerUserId,
        message: inviteMessage,
      });
      toast.success(res.message || "Invitation sent successfully!");
      setInviteModalOpen(false);
      setInviteTarget(null);
      setInviteMessage("");
    } catch (err) {
      console.error("Invitation error:", err);
    } finally {
      setInviting(false);
    }
  };

  const filteredFreelancers = freelancers.filter((f) => {
    const term = search.toLowerCase();
    const name = (f.user?.fullName || "").toLowerCase();
    const title = (f.professionalTitle || "").toLowerCase();
    const skills = (f.skills || []).join(" ").toLowerCase();
    return name.includes(term) || title.includes(term) || skills.includes(term);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Search */}
      <div className="glass-card border border-white/10 p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#3B82F6]">
              Talent Directory
            </span>
            <h1 className="text-3xl font-extrabold text-white font-display mt-1">
              Find Expert Freelancers
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Hire verified professionals with specialized skills for your next project.
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <Input
            icon={<FiSearch />}
            placeholder="Search by freelancer name, title, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Cards */}
      {loading ? (
        <SkeletonLoader type="directory" />
      ) : filteredFreelancers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => {
            const name = freelancer.user?.fullName || "Freelancer";
            const avatar = freelancer.user?.avatar;

            return (
              <GlassCard key={freelancer._id} className="flex flex-col justify-between p-6">
                <div className="space-y-4">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                        }
                        alt={name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 bg-[#09090B] shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{name}</h3>
                        <p className="text-xs text-[#3B82F6] font-semibold line-clamp-1 mt-0.5">
                          {freelancer.professionalTitle || "Freelance Specialist"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <AvailabilityBadge availability={freelancer.availability} />
                    <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <FiStar className="fill-amber-400 w-3.5 h-3.5" />
                      {(freelancer.averageRating || 0).toFixed(1)}
                    </span>
                  </div>

                  {/* Skills Pill list */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
                      {freelancer.skills && freelancer.skills.length > 0 ? (
                        freelancer.skills.slice(0, 4).map((skill, idx) => (
                          <SkillBadge key={idx} label={skill} />
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Stats Info */}
                  <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-300">
                      <FiBriefcase className="text-[#6366F1] w-4 h-4 shrink-0" />
                      <span>{freelancer.experience || 0} yrs exp</span>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <FiDollarSign className="w-4 h-4 shrink-0" />
                      <span>${freelancer.hourlyRate || 0}/hr</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-5 mt-4 border-t border-white/10 flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    icon={<FiEye />}
                    onClick={() => handleViewProfile(freelancer._id)}
                  >
                    View Profile
                  </Button>

                  {role === "client" && (
                    <Button
                      variant="primary"
                      className="flex-1"
                      icon={<FiSend />}
                      onClick={() => handleOpenInviteModal(freelancer)}
                    >
                      Invite
                    </Button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center border border-white/10 rounded-3xl">
          <p className="text-base font-semibold text-gray-300">No freelancers found.</p>
          <p className="text-xs text-gray-500 mt-1">Try searching with a different keyword.</p>
        </div>
      )}

      {/* Freelancer Profile Modal */}
      <Modal
        isOpen={Boolean(selectedFreelancer)}
        onClose={() => setSelectedFreelancer(null)}
        title={selectedFreelancer?.user?.fullName || "Freelancer Profile"}
        maxWidth="max-w-3xl"
      >
        {selectedFreelancer && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/10">
              <img
                src={
                  selectedFreelancer.user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                }
                alt={selectedFreelancer.user?.fullName}
                className="w-20 h-20 rounded-2xl object-cover border border-white/10 bg-[#09090B]"
              />
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h3 className="text-2xl font-bold text-white">{selectedFreelancer.user?.fullName}</h3>
                  <AvailabilityBadge availability={selectedFreelancer.availability} />
                </div>
                <p className="text-sm font-semibold text-[#3B82F6]">
                  {selectedFreelancer.professionalTitle || "Freelancer"}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                  {selectedFreelancer.location && (
                    <span className="flex items-center gap-1">
                      <FiMapPin /> {selectedFreelancer.location}
                    </span>
                  )}
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <FiStar className="fill-amber-400" />
                    {(selectedFreelancer.averageRating || 0).toFixed(1)} ({selectedFreelancer.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
              {role === "client" && (
                <Button
                  variant="primary"
                  icon={<FiSend />}
                  onClick={() => {
                    const target = selectedFreelancer;
                    setSelectedFreelancer(null);
                    handleOpenInviteModal(target);
                  }}
                >
                  Invite to Project
                </Button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Hourly Rate</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">${selectedFreelancer.hourlyRate || 0}/hr</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Experience</p>
                <p className="text-lg font-bold text-white mt-1">{selectedFreelancer.experience || 0} yrs</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-lg font-bold text-white mt-1">{selectedFreelancer.completedProjects || 0}</p>
              </div>
              <div className="p-3 rounded-2xl border border-white/10 bg-white/5">
                <p className="text-xs text-gray-400">Hours Logged</p>
                <p className="text-lg font-bold text-white mt-1">{selectedFreelancer.totalHoursWorked || 0} hrs</p>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">About</h4>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {selectedFreelancer.bio || "No bio provided."}
              </p>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFreelancer.skills && selectedFreelancer.skills.length > 0 ? (
                  selectedFreelancer.skills.map((skill, idx) => <SkillBadge key={idx} label={skill} />)
                ) : (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </div>
            </div>

            {/* Portfolio */}
            {selectedFreelancer.portfolio && selectedFreelancer.portfolio.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white">Portfolio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedFreelancer.portfolio.map((item, idx) => (
                    <PortfolioCard key={idx} title={item.title} link={item.link} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews & Ratings Section */}
            <div className="pt-4 border-t border-white/10">
              <ReviewsSection
                freelancerId={selectedFreelancer.user?._id || selectedFreelancer.user}
                averageRating={selectedFreelancer.averageRating}
                totalReviews={selectedFreelancer.totalReviews}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false);
          setInviteTarget(null);
        }}
        title={`Invite ${inviteTarget?.user?.fullName || "Freelancer"} to Project`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSendInvitation} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="glass-input w-full rounded-2xl border border-white/10 bg-[#0F172A] px-4 py-3 text-sm text-white outline-none"
            >
              {privateProjects.map((p) => (
                <option key={p._id} value={p._id} className="bg-[#0F172A] text-white">
                  {p.title} (${p.budget})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Invitation Message
            </label>
            <textarea
              rows={4}
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Explain why you are inviting this freelancer and outline key expectations..."
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setInviteModalOpen(false);
                setInviteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={inviting} icon={<FiSend />}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FreelancerDirectory;

