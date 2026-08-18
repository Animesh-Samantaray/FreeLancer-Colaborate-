import React from "react";
import GlassCard from "../GlassCard";
import BadgeEmblem from "./BadgeEmblem";
import { FiLock } from "react-icons/fi";

const LockedBadgeCard = ({ config, stats = {}, onClick }) => {
  if (!config) return null;

  const progress = config.calculateProgress
    ? config.calculateProgress(stats)
    : { current: 0, target: 1, percent: 0, remainingText: "Locked" };

  return (
    <GlassCard
      onClick={onClick}
      hover={true}
      className="p-5 flex flex-col justify-between items-center text-center relative overflow-hidden group transition-all duration-300 border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] opacity-75 hover:opacity-100"
    >
      <div className="w-full flex justify-between items-center mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500">
          Locked
        </span>
        <span className="text-xs font-mono font-bold text-gray-400">
          {progress.percent}%
        </span>
      </div>

      <div className="my-3 flex justify-center relative">
        <div className="filter grayscale contrast-75 opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
          <BadgeEmblem badgeKey={config.badgeKey} size="lg" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg text-gray-300 group-hover:text-amber-400 group-hover:border-amber-400/40 transition-colors">
            <FiLock className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 w-full">
        <h4 className="text-base font-bold text-gray-300 font-display group-hover:text-white transition-colors">
          {config.title}
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed px-1">
          {config.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 w-full space-y-2">
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
            style={{ width: `${Math.max(5, progress.percent)}%` }}
          />
        </div>
        <p className="text-[10px] text-indigo-300 font-medium truncate">
          {progress.remainingText}
        </p>
      </div>
    </GlassCard>
  );
};

export default LockedBadgeCard;
