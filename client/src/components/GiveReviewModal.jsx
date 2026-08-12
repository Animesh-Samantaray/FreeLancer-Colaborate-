import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FiStar, FiSend } from "react-icons/fi";
import Modal from "./Modal";
import Button from "./Button";
import StarRating from "./StarRating";
import { createReviewApi } from "../api/apiServices";

const GiveReviewModal = ({
  isOpen,
  onClose,
  project,
  onSuccess = () => {},
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars.");
      return;
    }

    if (!project?._id) {
      toast.error("Invalid project selected.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const res = await createReviewApi(project._id, {
        rating,
        comment: comment.trim(),
      });

      toast.success(res?.message || "Review submitted successfully!");
      onSuccess(project._id, res);
      onClose();
      // Reset state
      setRating(5);
      setComment("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit review.";
      if (msg.toLowerCase().includes("already reviewed")) {
        toast.success("✓ Review submitted");
        onSuccess(project._id, { alreadyReviewed: true });
        onClose();
        return;
      }
      setErrorMsg(msg);
      console.error("Submit review error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) {
          setErrorMsg("");
          onClose();
        }
      }}
      title={`Review Freelancer for "${project?.title || "Project"}"`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Rating Selector */}
        <div className="space-y-2 text-center sm:text-left">
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400">
            How would you rate this freelancer?
          </label>
          <div className="flex items-center justify-center sm:justify-start gap-3 py-2">
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={(newRating) => setRating(newRating)}
              size="w-8 h-8"
            />
            <span className="text-sm font-bold text-amber-400 min-w-[3rem]">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
            Review Comment (Optional)
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review... (e.g. Excellent work, great communication, and delivered on time!)"
            className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setErrorMsg("");
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
            icon={<FiSend />}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GiveReviewModal;
