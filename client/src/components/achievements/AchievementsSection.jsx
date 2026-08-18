import React, { useEffect, useState, useCallback, useMemo } from "react";
import GlassCard from "../GlassCard";
import AchievementCard from "./AchievementCard";
import LockedBadgeCard from "./LockedBadgeCard";
import AchievementDetailModal from "./AchievementDetailModal";
import Button from "../Button";
import { getMyAchievementsApi, getUserAchievementsApi } from "../../api/apiServices";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { getRoleBadges } from "../../config/badgeConfig";
import { FiAward, FiCheckCircle, FiLock, FiLayers } from "react-icons/fi";

const AchievementSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="glass-card rounded-3xl border border-white/10 p-6 flex flex-col items-center space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/10" />
        <div className="h-4 bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-white/10 rounded w-5/6" />
        <div className="h-3 bg-white/10 rounded w-1/3" />
      </div>
    ))}
  </div>
);

const AchievementsSection = ({ userId, title = "Achievements & Badges", isOwnProfile = true }) => {
  const { user, role: authRole } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const activeRole = useMemo(() => {
    if (user?.role) return user.role;
    if (authRole) return authRole;
    return "freelancer";
  }, [user, authRole]);

  const fetchAchievementsAndStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const achievementPromise = userId
        ? getUserAchievementsApi(userId)
        : getMyAchievementsApi();

      let profilePromise;
      if (activeRole === "client") {
        profilePromise = api.get("/client/profile").catch(() => null);
      } else {
        profilePromise = api.get("/freelancer/profile").catch(() => null);
      }

      const [achRes, profRes] = await Promise.all([achievementPromise, profilePromise]);

      if (achRes && achRes.success && Array.isArray(achRes.achievements)) {
        setAchievements(achRes.achievements);
      } else if (Array.isArray(achRes)) {
        setAchievements(achRes);
      } else {
        setAchievements([]);
      }

      if (profRes && profRes.data) {
        const p = profRes.data.freelancer || profRes.data.profile || profRes.data;
        setUserStats({
          completedProjects: p.completedProjects || 0,
          totalEarnings: p.totalEarnings || 0,
          totalSpent: p.totalSpent || 0,
          totalReviews: p.totalReviews || 0,
          averageRating: p.averageRating || 0,
          experience: p.experience || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch achievements or stats:", err);
      setError("Unable to load achievements system.");
    } finally {
      setLoading(false);
    }
  }, [userId, activeRole]);

  useEffect(() => {
    fetchAchievementsAndStats();
  }, [fetchAchievementsAndStats]);

  useEffect(() => {
    const handleUnlockedEvent = () => {
      fetchAchievementsAndStats();
    };
    window.addEventListener("achievement_unlocked", handleUnlockedEvent);
    return () => {
      window.removeEventListener("achievement_unlocked", handleUnlockedEvent);
    };
  }, [fetchAchievementsAndStats]);

  const earnedBadgeSet = useMemo(() => {
    return new Set(achievements.map((a) => a.badge));
  }, [achievements]);

  const roleCatalog = useMemo(() => {
    return getRoleBadges(activeRole);
  }, [activeRole]);

  const lockedBadges = useMemo(() => {
    return roleCatalog.filter((b) => !earnedBadgeSet.has(b.badgeKey));
  }, [roleCatalog, earnedBadgeSet]);

  const totalCatalogCount = roleCatalog.length || 6;
  const earnedCount = achievements.length;
  const totalCompletionPercent = Math.min(
    100,
    Math.round((earnedCount / totalCatalogCount) * 100)
  );

  return (
    <div className="space-y-6">
      <GlassCard hover={false} className="p-6 border border-white/10 bg-gradient-to-r from-indigo-900/20 via-purple-900/10 to-slate-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-extrabold text-white font-display">
                {title}
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Track earned badges, unlock platform milestones, and monitor real-time requirement progress.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shrink-0">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Badge Rank</p>
              <p className="text-sm font-bold text-amber-400">
                {earnedCount} / {totalCatalogCount} Unlocked ({totalCompletionPercent}%)
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
              <FiAward />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-1/2 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(5, totalCompletionPercent)}%` }}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              All Badges ({totalCatalogCount})
            </button>

            <button
              onClick={() => setActiveTab("earned")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "earned"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <FiCheckCircle className="text-emerald-300" />
              Unlocked ({earnedCount})
            </button>

            <button
              onClick={() => setActiveTab("locked")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === "locked"
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <FiLock className="text-amber-300" />
              In Progress ({lockedBadges.length})
            </button>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <AchievementSkeleton />
      ) : error ? (
        <GlassCard hover={false} className="p-8 text-center space-y-4 border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-300 font-semibold">{error}</p>
          <div className="flex justify-center">
            <Button variant="secondary" size="sm" onClick={fetchAchievementsAndStats}>
              Try Again
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {(activeTab === "all" || activeTab === "earned") &&
            achievements.map((item) => (
              <AchievementCard
                key={item._id || item.id || item.badge}
                achievement={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}

          {(activeTab === "all" || activeTab === "locked") &&
            lockedBadges.map((badgeConfig) => (
              <LockedBadgeCard
                key={badgeConfig.badgeKey}
                config={badgeConfig}
                stats={userStats}
                onClick={() =>
                  setSelectedItem({
                    ...badgeConfig,
                    isLocked: true,
                  })
                }
              />
            ))}
        </div>
      )}

      {!loading && activeTab === "earned" && achievements.length === 0 && (
        <GlassCard hover={false} className="p-8 text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
            🏅
          </div>
          <h3 className="text-base font-bold text-white font-display">No unlocked achievements yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            Switch to 'In Progress' to see how close you are to unlocking your first platform badge!
          </p>
        </GlassCard>
      )}

      <AchievementDetailModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        achievement={selectedItem}
        stats={userStats}
      />
    </div>
  );
};

export default AchievementsSection;
