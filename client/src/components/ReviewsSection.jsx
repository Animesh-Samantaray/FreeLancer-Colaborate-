import React, { useEffect, useState } from "react";
import { FiStar, FiMessageSquare } from "react-icons/fi";
import { getFreelancerReviewsApi } from "../api/apiServices";
import StarRating from "./StarRating";
import GlassCard from "./GlassCard";
import SkeletonLoader from "./SkeletonLoader";

function formatDateAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
}

const ReviewsSection = ({
  freelancerId,
  averageRating: propAverageRating,
  totalReviews: propTotalReviews,
  refreshTrigger = 0,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!freelancerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getFreelancerReviewsApi(freelancerId);
        if (data?.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Failed to load freelancer reviews", err);
        setError("Unable to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [freelancerId, refreshTrigger]);

  const totalReviewsCount = reviews.length > 0 ? reviews.length : (propTotalReviews || 0);
  const avgRatingValue = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (propAverageRating ? propAverageRating.toFixed(1) : "0.0");

  return (
    <GlassCard hover={false} className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-display">Reviews & Ratings</h2>
          <p className="text-xs text-gray-400 mt-1">Client feedback and ratings for completed projects</p>
        </div>

        {totalReviewsCount > 0 && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-fit">
            <StarRating rating={Number(avgRatingValue)} size="w-4 h-4" />
            <span className="text-lg font-bold text-white">{avgRatingValue}</span>
            <span className="text-xs text-gray-400">
              Based on {totalReviewsCount} review{totalReviewsCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-gray-400 space-y-3">
          <SkeletonLoader type="list" />
        </div>
      ) : error ? (
        <p className="text-xs text-red-400 py-4">{error}</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-4 divide-y divide-white/10">
          {reviews.map((rev, idx) => {
            const clientName = rev.client?.fullName || "Client";
            const clientAvatar = rev.client?.avatar;
            const projectTitle = rev.project?.title || "Completed Project";
            const formattedDate = formatDateAgo(rev.createdAt);

            return (
              <div key={rev._id || idx} className={`${idx > 0 ? "pt-4" : ""} space-y-3`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        clientAvatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                      }
                      alt={clientName}
                      className="w-10 h-10 rounded-2xl object-cover border border-white/10 bg-[#09090B] shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{clientName}</h4>
                      <p className="text-xs text-[#3B82F6] font-medium">{projectTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={rev.rating} size="w-3.5 h-3.5" />
                    <span className="text-[11px] text-gray-400">{formattedDate}</span>
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5 whitespace-pre-line italic">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <FiMessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-400">No reviews yet.</p>
          <p className="text-xs text-gray-500 mt-1">
            Reviews will appear here once clients rate completed projects.
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default ReviewsSection;
