import Achievement from "../models/Achievement.model.js";
import FreelancerProfile from "../models/FreelancerProfile.model.js";
import ClientProfile from "../models/ClientProfile.model.js";
import Project from "../models/Project.model.js";
import Review from "../models/Review.model.js";
import Payment from "../models/Payment.model.js";
import { createAndSendNotification } from "./notification.service.js";

const FREELANCER_BADGES = {
  TOP_RATED_FREELANCER: {
    badge: "TOP_RATED_FREELANCER",
    title: "Top Rated",
    description: "Rating of 4.5 or higher with at least 10 reviews.",
  },
  ELITE_FREELANCER: {
    badge: "ELITE_FREELANCER",
    title: "Elite Freelancer",
    description: "Successfully completed at least 5 projects.",
  },
  RELIABLE_PROFESSIONAL: {
    badge: "RELIABLE_PROFESSIONAL",
    title: "Reliable Professional",
    description: "Completed at least 2 projects with no cancelled projects.",
  },
  HIGH_EARNER: {
    badge: "HIGH_EARNER",
    title: "High Earner",
    description: "Earned at least ₹100 on the platform.",
  },
  EXPERIENCED_FREELANCER: {
    badge: "EXPERIENCED_FREELANCER",
    title: "Experienced Freelancer",
    description: "Has at least 3 years of experience and 4 completed projects.",
  },
  HIGHLY_RECOMMENDED: {
    badge: "HIGHLY_RECOMMENDED",
    title: "Highly Recommended",
    description: "Has at least 90% positive reviews with at least 20 reviews.",
  },
};

const CLIENT_BADGES = {
  TRUSTED_CLIENT: {
    badge: "TRUSTED_CLIENT",
    title: "Trusted Client",
    description: "Successfully completed at least 2 projects.",
  },
  PREMIUM_CLIENT: {
    badge: "PREMIUM_CLIENT",
    title: "Premium Client",
    description: "Spent at least ₹300 on the platform.",
  },
  TOP_RATED_CLIENT: {
    badge: "TOP_RATED_CLIENT",
    title: "Top Rated Client",
    description: "Rating of 4.5 or higher with at least 3 reviews.",
  },
  RELIABLE_EMPLOYER: {
    badge: "RELIABLE_EMPLOYER",
    title: "Reliable Employer",
    description: "Successfully completed at least 3 hires.",
  },
  PREFERRED_CLIENT: {
    badge: "PREFERRED_CLIENT",
    title: "Preferred Client",
    description: "Completed at least 3 projects with a rating of 4.5 or higher.",
  },
};

const checkFreelancerAchievements = async (userId) => {
  const profile = await FreelancerProfile.findOne({ user: userId });
  if (!profile) return [];

  const earnedAchievements = await Achievement.find({ user: userId }).select("badge");
  const earnedBadgeSet = new Set(earnedAchievements.map((a) => a.badge));

  const newlyEarned = [];

  const badgesToEvaluate = Object.keys(FREELANCER_BADGES).filter(
    (badgeKey) => !earnedBadgeSet.has(badgeKey)
  );

  if (badgesToEvaluate.length === 0) return [];

  // Local caching variables to avoid duplicate queries
  let completedProjectsCount = null;
  let cancelledProjectsCount = null;
  let totalEarnings = null;
  let reviews = null;

  const getCompletedProjects = async () => {
    if (completedProjectsCount === null) {
      completedProjectsCount = await Project.countDocuments({
        freelancers: userId,
        status: "Completed",
      });
    }
    return completedProjectsCount;
  };

  const getCancelledProjects = async () => {
    if (cancelledProjectsCount === null) {
      cancelledProjectsCount = await Project.countDocuments({
        freelancers: userId,
        status: "Cancelled",
      });
    }
    return cancelledProjectsCount;
  };

  const getTotalEarnings = async () => {
    if (totalEarnings === null) {
      const payments = await Payment.find({
        freelancer: userId,
        status: "Paid",
      }).select("amount");
      totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    }
    return totalEarnings;
  };

  const getReviews = async () => {
    if (reviews === null) {
      reviews = await Review.find({ freelancer: userId }).select("rating");
    }
    return reviews;
  };

  for (const badgeKey of badgesToEvaluate) {
    let qualifies = false;

    switch (badgeKey) {
      case "TOP_RATED_FREELANCER":
        qualifies = (profile.averageRating || 0) >= 4.5 && (profile.totalReviews || 0) >= 10;
        break;

      case "ELITE_FREELANCER":
        qualifies = (await getCompletedProjects()) >= 5;
        break;

      case "RELIABLE_PROFESSIONAL":
        qualifies = (await getCompletedProjects()) >= 2 && (await getCancelledProjects()) === 0;
        break;

      case "HIGH_EARNER":
        qualifies = (await getTotalEarnings()) >= 100;
        break;

      case "EXPERIENCED_FREELANCER":
        qualifies = (profile.experience || 0) >= 3 && (await getCompletedProjects()) >= 4;
        break;

      case "HIGHLY_RECOMMENDED": {
        const freelancerReviews = await getReviews();
        const total = freelancerReviews.length;
        if (total >= 20) {
          const positive = freelancerReviews.filter((r) => r.rating >= 4).length;
          qualifies = (positive / total * 100) >= 90;
        }
        break;
      }
    }

    if (qualifies) {
      const badgeInfo = FREELANCER_BADGES[badgeKey];
      try {
        const achievement = await Achievement.create({
          user: userId,
          badge: badgeInfo.badge,
          title: badgeInfo.title,
          description: badgeInfo.description,
        });
        newlyEarned.push(achievement);

        await createAndSendNotification({
          recipient: userId,
          sender: null,
          type: "ACHIEVEMENT_UNLOCKED",
          title: "Achievement Unlocked!",
          message: `You earned the ${badgeInfo.title} achievement.`,
        });
      } catch (err) {
        if (err.code !== 11000) {
          console.error(`Error saving achievement ${badgeKey} for freelancer ${userId}:`, err);
        }
      }
    }
  }

  return newlyEarned;
};

const checkClientAchievements = async (userId) => {
  const profile = await ClientProfile.findOne({ user: userId });
  if (!profile) return [];

  const earnedAchievements = await Achievement.find({ user: userId }).select("badge");
  const earnedBadgeSet = new Set(earnedAchievements.map((a) => a.badge));

  const newlyEarned = [];

  const badgesToEvaluate = Object.keys(CLIENT_BADGES).filter(
    (badgeKey) => !earnedBadgeSet.has(badgeKey)
  );

  if (badgesToEvaluate.length === 0) return [];

  // Local caching variables to avoid duplicate queries
  let completedProjectsCount = null;
  let completedHiresCount = null;
  let totalSpending = null;

  const getCompletedProjects = async () => {
    if (completedProjectsCount === null) {
      completedProjectsCount = await Project.countDocuments({
        client: userId,
        status: "Completed",
      });
    }
    return completedProjectsCount;
  };

  const getCompletedHires = async () => {
    if (completedHiresCount === null) {
      completedHiresCount = await Project.countDocuments({
        client: userId,
        status: "Completed",
        freelancers: { $exists: true, $not: { $size: 0 } },
      });
    }
    return completedHiresCount;
  };

  const getTotalSpending = async () => {
    if (totalSpending === null) {
      const payments = await Payment.find({
        client: userId,
        status: "Paid",
      }).select("amount");
      totalSpending = payments.reduce((sum, p) => sum + p.amount, 0);
    }
    return totalSpending;
  };

  for (const badgeKey of badgesToEvaluate) {
    let qualifies = false;

    switch (badgeKey) {
      case "TRUSTED_CLIENT":
        qualifies = (await getCompletedProjects()) >= 2;
        break;

      case "PREMIUM_CLIENT":
        qualifies = (await getTotalSpending()) >= 300;
        break;

      case "TOP_RATED_CLIENT":
        qualifies = (profile.averageRating || 0) >= 4.5 && (profile.totalReviews || 0) >= 3;
        break;

      case "RELIABLE_EMPLOYER":
        qualifies = (await getCompletedHires()) >= 3;
        break;

      case "PREFERRED_CLIENT":
        qualifies = (await getCompletedProjects()) >= 3 && (profile.averageRating || 0) >= 4.5;
        break;
    }

    if (qualifies) {
      const badgeInfo = CLIENT_BADGES[badgeKey];
      try {
        const achievement = await Achievement.create({
          user: userId,
          badge: badgeInfo.badge,
          title: badgeInfo.title,
          description: badgeInfo.description,
        });
        newlyEarned.push(achievement);

        await createAndSendNotification({
          recipient: userId,
          sender: null,
          type: "ACHIEVEMENT_UNLOCKED",
          title: "Achievement Unlocked!",
          message: `You earned the ${badgeInfo.title} achievement.`,
        });
      } catch (err) {
        if (err.code !== 11000) {
          console.error(`Error saving achievement ${badgeKey} for client ${userId}:`, err);
        }
      }
    }
  }

  return newlyEarned;
};

export const checkAndAwardAchievements = async (userId, role) => {
  try {
    if (!userId || !role) return [];

    if (role === "freelancer") {
      return await checkFreelancerAchievements(userId);
    }

    if (role === "client") {
      return await checkClientAchievements(userId);
    }

    return [];
  } catch (error) {
    console.error("Check And Award Achievements Error:", error);
    return [];
  }
};
