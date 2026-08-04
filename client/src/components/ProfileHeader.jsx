import React from "react";
import { FiEdit3, FiGlobe, FiMapPin, FiStar } from "react-icons/fi";
import Button from "./Button";
import AvailabilityBadge from "./AvailabilityBadge";

const ProfileHeader = ({
  title,
  subtitle,
  avatar,
  location,
  website,
  rating = 0,
  reviewsCount = 0,
  availability,
  onEdit,
  badgeText,
  isOwnProfile = false,
  extraDetails = [],
}) => {
  return (
    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Ambient Mesh Glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#6366F1]/15 to-[#3B82F6]/15 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar / Logo */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-[#6366F1] to-[#3B82F6] shadow-xl shadow-indigo-500/20">
              <img
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={title || "Profile"}
                className="w-full h-full object-cover rounded-[22px] bg-[#09090B]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                }}
              />
            </div>
            {availability && (
              <div className="absolute -bottom-2 -right-2 md:bottom-0 md:right-0">
                <AvailabilityBadge availability={availability} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                {title || "User Name"}
              </h1>
              {badgeText && (
                <span className="rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 px-3 py-1 text-xs font-semibold text-[#6366F1]">
                  {badgeText}
                </span>
              )}
            </div>

            {subtitle && <p className="text-base text-indigo-300 font-medium">{subtitle}</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-400">
              {location && (
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-[#6366F1] w-4 h-4" />
                  {location}
                </span>
              )}
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#3B82F6] transition"
                >
                  <FiGlobe className="text-[#3B82F6] w-4 h-4" />
                  {website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {rating > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <FiStar className="fill-amber-400 w-4 h-4" />
                  {rating.toFixed(1)} {reviewsCount > 0 && `(${reviewsCount} reviews)`}
                </span>
              )}
            </div>

            {extraDetails.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                {extraDetails.map((detail, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-gray-300"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {isOwnProfile && onEdit && (
          <Button
            onClick={onEdit}
            icon={<FiEdit3 />}
            className="w-full md:w-auto shrink-0 shadow-lg shadow-indigo-500/10"
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
