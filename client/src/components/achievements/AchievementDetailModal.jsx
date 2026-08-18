import React from "react";
import Modal from "../Modal";
import BadgeEmblem from "./BadgeEmblem";
import Button from "../Button";
import { getBadgeConfig } from "../../config/badgeConfig";
import { FiLock, FiCheckCircle } from "react-icons/fi";

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

const AchievementDetailModal = ({ isOpen, onClose, achievement, stats = {} }) => {
  if (!achievement) return null;

  const isLocked = Boolean(achievement.isLocked);
  const badgeKey = achievement.badge || achievement.badgeKey;
  const config = getBadgeConfig(badgeKey);

  const displayTitle = achievement.title || config.title;
  const displayDesc = achievement.description || config.description;
  const earnedDateFormatted = formatDate(achievement.earnedAt || achievement.createdAt);

  const progress = config.calculateProgress
    ? config.calculateProgress(stats)
    : { current: 0, target: 1, percent: 0, remainingText: "Locked" };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLocked ? "Locked Badge Requirements" : "Achievement Details"}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-5 py-2">
        <div
          className={`relative p-6 rounded-3xl bg-white/5 border border-white/10 w-full flex justify-center overflow-hidden ${
            isLocked ? "grayscale opacity-80" : ""
          }`}
          style={{
            background: `radial-gradient(circle, ${config.bgGlow} 0%, rgba(255,255,255,0.02) 70%)`,
          }}
        >
          <BadgeEmblem badgeKey={badgeKey} size="xl" customTitle={displayTitle} />
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl text-amber-400">
                <FiLock className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              {config.category} Badge
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                isLocked
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              }`}
            >
              {isLocked ? "In Progress" : "Unlocked"}
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white font-display mt-2">
            {displayTitle}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
            {displayDesc}
          </p>
        </div>

        {isLocked ? (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-400">Current Progress</span>
              <span className="text-indigo-400 font-mono font-bold">
                {progress.current} / {progress.target} ({progress.percent}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                style={{ width: `${Math.max(5, progress.percent)}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-300 pt-1 text-left">
              <FiLock className="shrink-0 text-amber-400" />
              <span>{progress.remainingText}</span>
            </div>
          </div>
        ) : (
          earnedDateFormatted && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 w-full space-y-1">
              <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                Earned Date
              </span>
              <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1.5">
                <FiCheckCircle className="text-emerald-400" /> Earned on {earnedDateFormatted}
              </span>
            </div>
          )
        )}

        <div className="pt-2 w-full">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AchievementDetailModal;
