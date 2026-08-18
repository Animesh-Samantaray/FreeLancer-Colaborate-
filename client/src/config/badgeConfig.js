import React from "react";
import {
  FiStar,
  FiAward,
  FiShield,
  FiCheckCircle,
  FiDollarSign,
  FiTrendingUp,
  FiBriefcase,
  FiThumbsUp,
  FiZap,
  FiUserCheck,
} from "react-icons/fi";

export const BADGE_CONFIG = {
  TOP_RATED_FREELANCER: {
    badgeKey: "TOP_RATED_FREELANCER",
    title: "Top Rated",
    description: "Rating of 4.5 or higher with at least 10 reviews.",
    category: "freelancer",
    icon: FiStar,
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    bgGlow: "rgba(245, 158, 11, 0.2)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    assetName: "top-rated.png",
    targetValue: 10,
    unit: "reviews",
    calculateProgress: (stats = {}) => {
      const current = stats.totalReviews || 0;
      const percent = Math.min(100, Math.round((current / 10) * 100));
      const remaining = 10 - current;
      return {
        current,
        target: 10,
        percent,
        remainingText: remaining > 0 ? `${remaining} more reviews needed with 4.5+ rating` : "Criteria met!",
      };
    },
  },
  ELITE_FREELANCER: {
    badgeKey: "ELITE_FREELANCER",
    title: "Elite Freelancer",
    description: "Successfully completed at least 5 projects.",
    category: "freelancer",
    icon: FiAward,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    bgGlow: "rgba(99, 102, 241, 0.2)",
    borderColor: "rgba(99, 102, 241, 0.4)",
    assetName: "elite.png",
    targetValue: 5,
    unit: "projects",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 5) * 100));
      const remaining = 5 - current;
      return {
        current,
        target: 5,
        percent,
        remainingText: remaining > 0 ? `${remaining} more completed projects needed` : "Criteria met!",
      };
    },
  },
  RELIABLE_PROFESSIONAL: {
    badgeKey: "RELIABLE_PROFESSIONAL",
    title: "Reliable Professional",
    description: "Completed at least 2 projects with no cancelled projects.",
    category: "freelancer",
    icon: FiCheckCircle,
    gradient: "from-emerald-400 via-teal-500 to-emerald-600",
    bgGlow: "rgba(16, 185, 129, 0.2)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    assetName: "reliable.png",
    targetValue: 2,
    unit: "projects",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 2) * 100));
      const remaining = 2 - current;
      return {
        current,
        target: 2,
        percent,
        remainingText: remaining > 0 ? `${remaining} more completed projects needed` : "Criteria met!",
      };
    },
  },
  HIGH_EARNER: {
    badgeKey: "HIGH_EARNER",
    title: "High Earner",
    description: "Earned at least ₹100 on the platform.",
    category: "freelancer",
    icon: FiDollarSign,
    gradient: "from-green-400 via-emerald-500 to-cyan-500",
    bgGlow: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.4)",
    assetName: "high-earner.png",
    targetValue: 100,
    unit: "earnings",
    calculateProgress: (stats = {}) => {
      const current = stats.totalEarnings || 0;
      const percent = Math.min(100, Math.round((current / 100) * 100));
      const remaining = 100 - current;
      return {
        current: `₹${current}`,
        target: "₹100",
        percent,
        remainingText: remaining > 0 ? `₹${remaining} more earnings needed` : "Criteria met!",
      };
    },
  },
  EXPERIENCED_FREELANCER: {
    badgeKey: "EXPERIENCED_FREELANCER",
    title: "Experienced Freelancer",
    description: "Has at least 3 years of experience and 4 completed projects.",
    category: "freelancer",
    icon: FiTrendingUp,
    gradient: "from-blue-400 via-indigo-500 to-purple-600",
    bgGlow: "rgba(59, 130, 246, 0.2)",
    borderColor: "rgba(59, 130, 246, 0.4)",
    assetName: "experienced.png",
    targetValue: 4,
    unit: "projects",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 4) * 100));
      const remaining = 4 - current;
      return {
        current,
        target: 4,
        percent,
        remainingText: remaining > 0 ? `${remaining} more completed projects needed` : "Criteria met!",
      };
    },
  },
  HIGHLY_RECOMMENDED: {
    badgeKey: "HIGHLY_RECOMMENDED",
    title: "Highly Recommended",
    description: "Has at least 90% positive reviews with at least 20 reviews.",
    category: "freelancer",
    icon: FiThumbsUp,
    gradient: "from-rose-400 via-pink-500 to-red-500",
    bgGlow: "rgba(244, 63, 94, 0.2)",
    borderColor: "rgba(244, 63, 94, 0.4)",
    assetName: "highly-recommended.png",
    targetValue: 20,
    unit: "reviews",
    calculateProgress: (stats = {}) => {
      const current = stats.totalReviews || 0;
      const percent = Math.min(100, Math.round((current / 20) * 100));
      const remaining = 20 - current;
      return {
        current,
        target: 20,
        percent,
        remainingText: remaining > 0 ? `${remaining} more reviews needed` : "Criteria met!",
      };
    },
  },
  TRUSTED_CLIENT: {
    badgeKey: "TRUSTED_CLIENT",
    title: "Trusted Client",
    description: "Successfully completed at least 2 projects.",
    category: "client",
    icon: FiShield,
    gradient: "from-cyan-400 via-blue-500 to-indigo-600",
    bgGlow: "rgba(6, 182, 212, 0.2)",
    borderColor: "rgba(6, 182, 212, 0.4)",
    assetName: "trusted-client.png",
    targetValue: 2,
    unit: "projects",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 2) * 100));
      const remaining = 2 - current;
      return {
        current,
        target: 2,
        percent,
        remainingText: remaining > 0 ? `${remaining} more completed projects needed` : "Criteria met!",
      };
    },
  },
  PREMIUM_CLIENT: {
    badgeKey: "PREMIUM_CLIENT",
    title: "Premium Client",
    description: "Spent at least ₹300 on the platform.",
    category: "client",
    icon: FiZap,
    gradient: "from-amber-300 via-yellow-500 to-amber-600",
    bgGlow: "rgba(234, 179, 8, 0.2)",
    borderColor: "rgba(234, 179, 8, 0.4)",
    assetName: "premium-client.png",
    targetValue: 300,
    unit: "spent",
    calculateProgress: (stats = {}) => {
      const current = stats.totalSpent || 0;
      const percent = Math.min(100, Math.round((current / 300) * 100));
      const remaining = 300 - current;
      return {
        current: `₹${current}`,
        target: "₹300",
        percent,
        remainingText: remaining > 0 ? `₹${remaining} more spending needed` : "Criteria met!",
      };
    },
  },
  TOP_RATED_CLIENT: {
    badgeKey: "TOP_RATED_CLIENT",
    title: "Top Rated Client",
    description: "Rating of 4.5 or higher with at least 3 reviews.",
    category: "client",
    icon: FiStar,
    gradient: "from-amber-400 via-orange-500 to-rose-500",
    bgGlow: "rgba(245, 158, 11, 0.2)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    assetName: "top-rated-client.png",
    targetValue: 3,
    unit: "reviews",
    calculateProgress: (stats = {}) => {
      const current = stats.totalReviews || 0;
      const percent = Math.min(100, Math.round((current / 3) * 100));
      const remaining = 3 - current;
      return {
        current,
        target: 3,
        percent,
        remainingText: remaining > 0 ? `${remaining} more reviews needed with 4.5+ rating` : "Criteria met!",
      };
    },
  },
  RELIABLE_EMPLOYER: {
    badgeKey: "RELIABLE_EMPLOYER",
    title: "Reliable Employer",
    description: "Successfully completed at least 3 hires.",
    category: "client",
    icon: FiBriefcase,
    gradient: "from-teal-400 via-emerald-500 to-blue-600",
    bgGlow: "rgba(20, 184, 166, 0.2)",
    borderColor: "rgba(20, 184, 166, 0.4)",
    assetName: "reliable-employer.png",
    targetValue: 3,
    unit: "hires",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 3) * 100));
      const remaining = 3 - current;
      return {
        current,
        target: 3,
        percent,
        remainingText: remaining > 0 ? `${remaining} more hires needed` : "Criteria met!",
      };
    },
  },
  PREFERRED_CLIENT: {
    badgeKey: "PREFERRED_CLIENT",
    title: "Preferred Client",
    description: "Completed at least 3 projects with a rating of 4.5 or higher.",
    category: "client",
    icon: FiUserCheck,
    gradient: "from-violet-400 via-purple-500 to-indigo-600",
    bgGlow: "rgba(139, 92, 246, 0.2)",
    borderColor: "rgba(139, 92, 246, 0.4)",
    assetName: "preferred-client.png",
    targetValue: 3,
    unit: "projects",
    calculateProgress: (stats = {}) => {
      const current = stats.completedProjects || 0;
      const percent = Math.min(100, Math.round((current / 3) * 100));
      const remaining = 3 - current;
      return {
        current,
        target: 3,
        percent,
        remainingText: remaining > 0 ? `${remaining} more completed projects needed` : "Criteria met!",
      };
    },
  },
};

export const FALLBACK_BADGE_CONFIG = {
  badgeKey: "UNKNOWN_BADGE",
  title: "Achievement Unlocked",
  description: "Special milestone recognized on the platform.",
  category: "general",
  icon: FiAward,
  gradient: "from-gray-500 via-slate-600 to-gray-700",
  bgGlow: "rgba(156, 163, 175, 0.2)",
  borderColor: "rgba(156, 163, 175, 0.4)",
  assetName: "generic-badge.png",
  calculateProgress: () => ({
    current: 0,
    target: 1,
    percent: 0,
    remainingText: "Keep participating to unlock",
  }),
};

export const getBadgeConfig = (badgeKey) => {
  if (!badgeKey) return FALLBACK_BADGE_CONFIG;
  const config = BADGE_CONFIG[badgeKey];
  if (!config) {
    console.warn(`[BadgeConfig] Unknown badge code received from backend: "${badgeKey}"`);
    return {
      ...FALLBACK_BADGE_CONFIG,
      title: badgeKey.replace(/_/g, " "),
    };
  }
  return config;
};

export const getRoleBadges = (role = "freelancer") => {
  const targetCategory = role === "client" ? "client" : "freelancer";
  return Object.values(BADGE_CONFIG).filter(
    (b) => b.category === targetCategory
  );
};
