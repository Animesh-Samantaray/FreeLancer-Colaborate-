import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiCheckCircle,
  FiActivity,
  FiClock,
  FiDollarSign,
  FiStar,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiFileText,
  FiMapPin,
  FiBriefcase,
  FiPlus,
  FiTrash2,
  FiLink,
  FiEdit3,
} from "react-icons/fi";
import api from "../../api/axios";
import ProfileHeader from "../../components/ProfileHeader";
import StatsCard from "../../components/StatsCard";
import GlassCard from "../../components/GlassCard";
import SkillBadge from "../../components/SkillBadge";
import PortfolioCard from "../../components/PortfolioCard";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SkeletonLoader from "../../components/SkeletonLoader";
import { useProfile } from "../../context/ProfileContext";

function FreelancerProfile() {
  const { refetchProfile } = useProfile();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    professionalTitle: "",
    bio: "",
    skillsInput: "",
    skills: [],
    experience: 0,
    hourlyRate: 0,
    location: "",
    languagesInput: "",
    languages: [],
    github: "",
    linkedin: "",
    website: "",
    resume: "",
    availability: "Available",
    portfolio: [],
  });

  // Portfolio Item state for modal
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioLink, setNewPortfolioLink] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/freelancer/profile");
      if (res.data?.freelancer) {
        const p = res.data.freelancer;
        setProfile(p);
        setFormData({
          professionalTitle: p.professionalTitle || "",
          bio: p.bio || "",
          skills: p.skills || [],
          skillsInput: (p.skills || []).join(", "),
          experience: p.experience || 0,
          hourlyRate: p.hourlyRate || 0,
          location: p.location || "",
          languages: p.languages || [],
          languagesInput: (p.languages || []).join(", "),
          github: p.github || "",
          linkedin: p.linkedin || "",
          website: p.website || "",
          resume: p.resume || "",
          availability: p.availability || "Available",
          portfolio: p.portfolio || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch freelancer profile", err);
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

  const handleAddPortfolio = () => {
    if (!newPortfolioTitle.trim() || !newPortfolioLink.trim()) {
      toast.error("Please provide both title and link for portfolio project");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      portfolio: [
        ...prev.portfolio,
        { title: newPortfolioTitle.trim(), link: newPortfolioLink.trim() },
      ],
    }));

    setNewPortfolioTitle("");
    setNewPortfolioLink("");
  };

  const handleRemovePortfolio = (index) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // Parse comma-separated skills and languages
      const parsedSkills = formData.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedLanguages = formData.languagesInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        professionalTitle: formData.professionalTitle,
        bio: formData.bio,
        skills: parsedSkills,
        experience: Number(formData.experience),
        hourlyRate: Number(formData.hourlyRate),
        location: formData.location,
        languages: parsedLanguages,
        github: formData.github,
        linkedin: formData.linkedin,
        website: formData.website,
        resume: formData.resume,
        availability: formData.availability,
        portfolio: formData.portfolio,
      };

      const res = await api.put("/freelancer/profile", payload);
      if (res.data?.freelancer) {
        setProfile(res.data.freelancer);
        toast.success(res.data.message || "Freelancer profile updated successfully!");
        await refetchProfile();
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update freelancer profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  const extraHeaderDetails = [
    profile?.experience ? `${profile.experience} years experience` : null,
    profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <ProfileHeader
        title={profile?.user?.fullName || "Freelancer Name"}
        subtitle={profile?.professionalTitle || "Freelancer Title"}
        avatar={profile?.user?.avatar}
        location={profile?.location || "Location not set"}
        website={profile?.website}
        rating={profile?.averageRating || 0}
        reviewsCount={profile?.totalReviews || 0}
        availability={profile?.availability || "Available"}
        badgeText="Freelancer Profile"
        isOwnProfile={true}
        onEdit={() => setIsEditModalOpen(true)}
        extraDetails={extraHeaderDetails}
      />

      {/* Statistics Section */}
      <div>
        <h2 className="text-lg font-bold text-white font-display mb-4">Performance & Earnings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatsCard
            title="Completed"
            value={profile?.completedProjects || 0}
            subtitle="Projects"
            icon={<FiCheckCircle className="w-5 h-5" />}
            accent="from-emerald-500 to-teal-600"
          />
          <StatsCard
            title="Ongoing"
            value={profile?.ongoingProjects || 0}
            subtitle="Projects"
            icon={<FiActivity className="w-5 h-5" />}
            accent="from-[#6366F1] to-[#3B82F6]"
          />
          <StatsCard
            title="Hours Worked"
            value={`${profile?.totalHoursWorked || 0}`}
            subtitle="Total logged"
            icon={<FiClock className="w-5 h-5" />}
            accent="from-[#3B82F6] to-[#8B5CF6]"
          />
          <StatsCard
            title="Total Earnings"
            value={`$${(profile?.totalEarnings || 0).toLocaleString()}`}
            subtitle="Recorded gross"
            icon={<FiDollarSign className="w-5 h-5" />}
            accent="from-purple-500 to-indigo-600"
          />
          <StatsCard
            title="Avg. Rating"
            value={(profile?.averageRating || 0).toFixed(1)}
            subtitle="Overall rating"
            icon={<FiStar className="w-5 h-5" />}
            accent="from-amber-400 to-orange-500"
          />
          <StatsCard
            title="Hourly Rate"
            value={`$${profile?.hourlyRate || 0}/hr`}
            subtitle="Standard rate"
            icon={<FiBriefcase className="w-5 h-5" />}
            accent="from-pink-500 to-rose-600"
          />
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Portfolio (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <GlassCard hover={false} className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-white font-display pb-3 border-b border-white/10">
              About Me
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
              {profile?.bio ||
                "No bio added yet. Click 'Edit Profile' to introduce your background, technical expertise, and passion."}
            </p>
          </GlassCard>

          {/* Skills & Languages */}
          <GlassCard hover={false} className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-white font-display pb-3 border-b border-white/10">
              Skills & Expertise
            </h2>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">
                Technical Skills
              </p>
              {profile?.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <SkillBadge key={idx} label={skill} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No skills listed yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">
                Languages
              </p>
              {profile?.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, idx) => (
                    <SkillBadge key={idx} label={lang} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No languages listed yet.</p>
              )}
            </div>
          </GlassCard>

          {/* Portfolio */}
          <GlassCard hover={false} className="p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-xl font-bold text-white font-display">Portfolio Projects</h2>
              <span className="text-xs text-gray-400">
                {profile?.portfolio?.length || 0} Projects showcased
              </span>
            </div>

            {profile?.portfolio && profile.portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.portfolio.map((item, idx) => (
                  <PortfolioCard key={idx} title={item.title} link={item.link} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiBriefcase className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-400">No portfolio projects added</p>
                <p className="text-xs text-gray-500 mt-1">
                  Add project samples via 'Edit Profile' to attract prospective clients.
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Social Links & Contact Details */}
        <div className="space-y-6">
          <GlassCard hover={false} className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-white font-display pb-3 border-b border-white/10">
              Links & Attachments
            </h3>

            <div className="space-y-3">
              {profile?.github ? (
                <a
                  href={profile.github.startsWith("http") ? profile.github : `https://${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition text-sm text-gray-200"
                >
                  <FiGithub className="w-5 h-5 text-purple-400" />
                  <span className="truncate">GitHub Profile</span>
                </a>
              ) : null}

              {profile?.linkedin ? (
                <a
                  href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition text-sm text-gray-200"
                >
                  <FiLinkedin className="w-5 h-5 text-[#3B82F6]" />
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              ) : null}

              {profile?.website ? (
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition text-sm text-gray-200"
                >
                  <FiGlobe className="w-5 h-5 text-[#6366F1]" />
                  <span className="truncate">Personal Website</span>
                </a>
              ) : null}

              {profile?.resume ? (
                <a
                  href={profile.resume.startsWith("http") ? profile.resume : `https://${profile.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 transition text-sm text-emerald-400 font-medium"
                >
                  <FiFileText className="w-5 h-5 text-emerald-400" />
                  <span className="truncate">Download Resume</span>
                </a>
              ) : null}

              {!profile?.github && !profile?.linkedin && !profile?.website && !profile?.resume && (
                <p className="text-xs text-gray-500 py-2">No links added yet.</p>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Edit Freelancer Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Freelancer Profile"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Professional Title"
              name="professionalTitle"
              value={formData.professionalTitle}
              onChange={handleChange}
              placeholder="e.g. Senior Full-Stack Engineer"
              icon={<FiBriefcase />}
              required
            />

            <Input
              label="Availability Status"
              name="availability"
              type="select"
              value={formData.availability}
              onChange={handleChange}
              options={[
                { value: "Available", label: "Available for Hire" },
                { value: "Busy", label: "Busy / Unavailable" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Years of Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              placeholder="e.g. 5"
            />

            <Input
              label="Hourly Rate ($/hr)"
              name="hourlyRate"
              type="number"
              value={formData.hourlyRate}
              onChange={handleChange}
              placeholder="e.g. 60"
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. New York, USA"
              icon={<FiMapPin />}
            />
          </div>

          <Input
            label="Bio / Profile Overview"
            name="bio"
            type="textarea"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Write a clear summary of your experience, skills, and work style..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Skills (Comma separated)"
              name="skillsInput"
              value={formData.skillsInput}
              onChange={handleChange}
              placeholder="React, Node.js, Tailwind, TypeScript"
            />

            <Input
              label="Languages (Comma separated)"
              name="languagesInput"
              value={formData.languagesInput}
              onChange={handleChange}
              placeholder="English, Spanish, French"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Profile URL"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              icon={<FiGithub />}
            />

            <Input
              label="LinkedIn Profile URL"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              icon={<FiLinkedin />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Website URL"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
              icon={<FiGlobe />}
            />

            <Input
              label="Resume URL / PDF link"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              placeholder="https://example.com/resume.pdf"
              icon={<FiFileText />}
            />
          </div>

          {/* Portfolio Section Editor */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
            <h4 className="text-sm font-semibold text-white">Portfolio Projects</h4>

            {/* List existing portfolio */}
            {formData.portfolio.length > 0 ? (
              <div className="space-y-2">
                {formData.portfolio.map((item, idx) => (
                  <PortfolioCard
                    key={idx}
                    title={item.title}
                    link={item.link}
                    editable={true}
                    onRemove={() => handleRemovePortfolio(idx)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No portfolio projects added yet.</p>
            )}

            {/* Add new portfolio item controls */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <p className="text-xs font-semibold text-gray-400">Add New Portfolio Project</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Project Title (e.g. E-Commerce Web App)"
                  value={newPortfolioTitle}
                  onChange={(e) => setNewPortfolioTitle(e.target.value)}
                />
                <Input
                  placeholder="Project Link (e.g. https://demo.com)"
                  value={newPortfolioLink}
                  onChange={(e) => setNewPortfolioLink(e.target.value)}
                  icon={<FiLink />}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddPortfolio}
                icon={<FiPlus />}
                className="w-full sm:w-auto text-xs py-2"
              >
                Add Project to Portfolio
              </Button>
            </div>
          </div>

          {/* Actions */}
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
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default FreelancerProfile;
