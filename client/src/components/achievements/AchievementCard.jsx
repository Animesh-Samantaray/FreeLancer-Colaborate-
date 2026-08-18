import React from "react";
import GlassCard from "../GlassCard";
import BadgeEmblem from "./BadgeEmblem";
import { getBadgeConfig } from "../../config/badgeConfig";

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return "";
  }
};

const AchievementCard = ({ achievement, onClick }) => {
  if (!achievement) return null;

  const badgeKey = achievement.badge;
  const config = getBadgeConfig(badgeKey);

  const displayTitle = achievement.title || config.title;
  const displayDesc = achievement.description || config.description;
  const earnedDateFormatted = formatDate(achievement.earnedAt || achievement.createdAt);

  return (
    <GlassCard
      onClick={onClick}
      hover={true}
      className="p-5 flex flex-col justify-between items-center text-center relative overflow-hidden group transition-all duration-300 border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]"
    >
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 opacity-40 group-hover:opacity-80"
        style={{ backgroundColor: config.bgGlow }}
      />

      <div className="w-full flex justify-end mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
          {config.category}
        </span>
      </div>

      <div className="my-3 flex justify-center">
        <BadgeEmblem badgeKey={badgeKey} size="lg" customTitle={displayTitle} />
      </div>

      <div className="space-y-1.5 w-full">
        <h4 className="text-base font-bold text-white font-display group-hover:text-indigo-300 transition-colors">
          {displayTitle}
        </h4>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed px-1">
          {displayDesc}
        </p>
      </div>

      {earnedDateFormatted && (
        <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-1 text-[11px] text-gray-400 font-medium">
          <span className="text-amber-400">🏆</span>
          <span>Earned {earnedDateFormatted}</span>
        </div>
      )}
    </GlassCard>
  );
};

export default AchievementCard;
