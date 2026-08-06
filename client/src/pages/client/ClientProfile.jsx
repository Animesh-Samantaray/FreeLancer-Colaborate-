import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiFolder,
  FiCheckCircle,
  FiActivity,
  FiDollarSign,
  FiStar,
  FiGlobe,
  FiMapPin,
  FiBriefcase,
  FiImage,
  FiFileText,
} from "react-icons/fi";
import api from "../../api/axios";
import ProfileHeader from "../../components/ProfileHeader";
import StatsCard from "../../components/StatsCard";
import GlassCard from "../../components/GlassCard";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SkeletonLoader from "../../components/SkeletonLoader";
import { useProfile } from "../../context/ProfileContext";

function ClientProfile() {
  const { refetchProfile } = useProfile();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    industry: "",
    website: "",
    location: "",
    companyLogo: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/client/profile");
      if (res.data?.profile) {
        const p = res.data.profile;
        setProfile(p);
        setFormData({
          companyName: p.companyName || "",
          companyDescription: p.companyDescription || "",
          industry: p.industry || "",
          website: p.website || "",
          location: p.location || "",
          companyLogo: p.companyLogo || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch client profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/client/profile", formData);
      if (res.data?.profile) {
        setProfile(res.data.profile);
        toast.success(res.data.message || "Profile updated successfully!");
        await refetchProfile();
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Profile Top Header */}
      <ProfileHeader
        title={profile?.companyName || profile?.user?.fullName || "Company Name"}
        subtitle={profile?.industry || "Client / Employer"}
        avatar={profile?.companyLogo}
        location={profile?.location || "Location not set"}
        website={profile?.website}
        rating={profile?.averageRating || 0}
        reviewsCount={profile?.totalReviews || 0}
        badgeText="Client Profile"
        isOwnProfile={true}
        onEdit={() => setIsEditModalOpen(true)}
      />

      {/* Statistics Section */}
      <div>
        <h2 className="text-lg font-bold text-white font-display mb-4">Company Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatsCard
            title="Total Projects"
            value={profile?.totalProjects || 0}
            subtitle="Projects created"
            icon={<FiFolder className="w-5 h-5" />}
          />
          <StatsCard
            title="Completed"
            value={profile?.completedProjects || 0}
            subtitle="Finished jobs"
            icon={<FiCheckCircle className="w-5 h-5" />}
            accent="from-emerald-500 to-teal-600"
          />
          <StatsCard
            title="Active"
            value={profile?.activeProjects || 0}
            subtitle="Ongoing jobs"
            icon={<FiActivity className="w-5 h-5" />}
            accent="from-[#3B82F6] to-[#8B5CF6]"
          />
          <StatsCard
            title="Total Spent"
            value={`$${(profile?.totalSpent || 0).toLocaleString()}`}
            subtitle="Spent on hires"
            icon={<FiDollarSign className="w-5 h-5" />}
            accent="from-purple-500 to-indigo-600"
          />
          <StatsCard
            title="Avg. Rating"
            value={(profile?.averageRating || 0).toFixed(1)}
            subtitle={`${profile?.totalReviews || 0} reviews`}
            icon={<FiStar className="w-5 h-5" />}
            accent="from-amber-400 to-orange-500"
          />
        </div>
      </div>

      {/* Company Description & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard hover={false} className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-white font-display pb-3 border-b border-white/10">
              About {profile?.companyName || "the Company"}
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {profile?.companyDescription ||
                "No description provided yet. Click 'Edit Profile' to add company details, mission, and background."}
            </p>
          </GlassCard>
        </div>

        <div>
          <GlassCard hover={false} className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-display pb-3 border-b border-white/10">
              Company Overview
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Industry</p>
                <p className="text-white font-semibold mt-1 flex items-center gap-2">
                  <FiBriefcase className="text-[#6366F1]" />
                  {profile?.industry || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Location</p>
                <p className="text-white font-semibold mt-1 flex items-center gap-2">
                  <FiMapPin className="text-[#6366F1]" />
                  {profile?.location || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Website</p>
                {profile?.website ? (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3B82F6] font-semibold mt-1 flex items-center gap-2 hover:underline"
                  >
                    <FiGlobe />
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-gray-500 mt-1">Not provided</p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client Profile"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Acme Tech Solutions"
            icon={<FiBriefcase />}
            required
          />

          <Input
            label="Industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g. Software & Technology"
            icon={<FiFileText />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA"
              icon={<FiMapPin />}
            />

            <Input
              label="Website URL"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              icon={<FiGlobe />}
            />
          </div>

          <Input
            label="Company Logo Image URL"
            name="companyLogo"
            value={formData.companyLogo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            icon={<FiImage />}
          />

          <Input
            label="Company Description"
            name="companyDescription"
            type="textarea"
            rows={5}
            value={formData.companyDescription}
            onChange={handleChange}
            placeholder="Describe your company, mission, and typical projects..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClientProfile;
