import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import Proposal from "../models/Proposal.model.js";
import Review from "../models/Review.model.js";
import FreelancerProfile from "../models/FreelancerProfile.model.js";
import ClientProfile from "../models/ClientProfile.model.js";
import Milestone from "../models/Milestone.model.js";

/**
 * Calculates start and end Date objects for the current week
 */
export const getWeeklyRange = () => {
  const start = new Date();
  const day = start.getDay();

  const daysToMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Calculates start and end Date objects for the current month
 */
export const getMonthlyRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Helper to fetch report data for a specific date range
 */
export const fetchReportData = async (startDate, endDate) => {
  const periodQuery = {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  // USER STATISTICS
  const [
    totalUsers,
    newUsers,
    totalFreelancers,
    totalClients,
    newFreelancers,
    newClients,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments(periodQuery),
    User.countDocuments({ role: "freelancer" }),
    User.countDocuments({ role: "client" }),
    User.countDocuments({ role: "freelancer", ...periodQuery }),
    User.countDocuments({ role: "client", ...periodQuery }),
  ]);

  //  PROJECT STATISTICS 
  const [
    totalProjectsOverall,
    totalProjectsPeriod,
    completedProjectsPeriod,
    ongoingProjectsPeriod,
    openProjectsPeriod,
    cancelledProjectsPeriod,
  ] = await Promise.all([
    Project.countDocuments({}),
    Project.countDocuments(periodQuery),
    Project.countDocuments({ status: "Completed", ...periodQuery }),
    Project.countDocuments({ status: "In Progress", ...periodQuery }),
    Project.countDocuments({ status: "Open", ...periodQuery }),
    Project.countDocuments({ status: "Cancelled", ...periodQuery }),
  ]);

  //  PROPOSAL STATISTICS
  const [
    totalProposalsPeriod,
    acceptedProposalsPeriod,
    rejectedProposalsPeriod,
    pendingProposalsPeriod,
  ] = await Promise.all([
    Proposal.countDocuments(periodQuery),
    Proposal.countDocuments({ status: "Accepted", ...periodQuery }),
    Proposal.countDocuments({ status: "Rejected", ...periodQuery }),
    Proposal.countDocuments({ status: "Pending", ...periodQuery }),
  ]);

  // FREELANCER STATISTICS
  const totalFreelancerProfiles = await FreelancerProfile.countDocuments({});
  const freelancerProfileAgg = await FreelancerProfile.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$averageRating" },
        totalReviews: { $sum: "$totalReviews" },
        completedProjects: { $sum: "$completedProjects" },
      },
    },
  ]);
  const freelancerStats = freelancerProfileAgg[0] || {
    avgRating: 0,
    totalReviews: 0,
    completedProjects: 0,
  };

  // CLIENT STATISTICS
  const totalClientProfiles = await ClientProfile.countDocuments({});
  const clientProfileAgg = await ClientProfile.aggregate([
    {
      $group: {
        _id: null,
        totalHires: { $sum: "$totalHires" },
        completedProjects: { $sum: "$completedProjects" },
      },
    },
  ]);
  const clientStats = clientProfileAgg[0] || {
    totalHires: 0,
    completedProjects: 0,
  };

  //  REVIEW STATISTICS 
  const reviewStatsAgg = await Review.aggregate([
    {
      $match: periodQuery,
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgRating: { $avg: "$rating" },
        fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
  ]);
  const reviewStats = reviewStatsAgg[0] || {
    total: 0,
    avgRating: 0,
    fiveStar: 0,
    fourStar: 0,
    threeStar: 0,
    twoStar: 0,
    oneStar: 0,
  };

  //  FINANCIAL STATISTICS 
  const projectEarningsAgg = await Project.aggregate([
    {
      $match: {
        status: "Completed",
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$budget" },
      },
    },
  ]);
  const totalEarnings = projectEarningsAgg[0]?.total || 0;

  // Milestone earnings: sum amount of milestones completed in this period
  const milestoneEarningsAgg = await Milestone.aggregate([
    {
      $match: {
        status: "Completed",
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);
  const totalMilestonePayments = milestoneEarningsAgg[0]?.total || 0;

  return {
    users: {
      total: totalUsers,
      newUsers: newUsers,
      freelancers: totalFreelancers,
      clients: totalClients,
      newFreelancers,
      newClients,
    },
    projects: {
      total: totalProjectsPeriod,
      completed: completedProjectsPeriod,
      ongoing: ongoingProjectsPeriod,
      open: openProjectsPeriod,
      cancelled: cancelledProjectsPeriod,
      totalOverall: totalProjectsOverall,
    },
    proposals: {
      total: totalProposalsPeriod,
      accepted: acceptedProposalsPeriod,
      rejected: rejectedProposalsPeriod,
      pending: pendingProposalsPeriod,
    },
    freelancers: {
      total: totalFreelancerProfiles,
      averageRating: freelancerStats.avgRating ? Number(freelancerStats.avgRating.toFixed(2)) : 0,
      totalReviews: freelancerStats.totalReviews,
      completedProjects: freelancerStats.completedProjects,
    },
    clients: {
      total: totalClientProfiles,
      totalHires: clientStats.totalHires,
      completedProjects: clientStats.completedProjects,
    },
    reviews: {
      total: reviewStats.total,
      averageRating: reviewStats.avgRating ? Number(reviewStats.avgRating.toFixed(2)) : 0,
      fiveStar: reviewStats.fiveStar,
      fourStar: reviewStats.fourStar,
      threeStar: reviewStats.threeStar,
      twoStar: reviewStats.twoStar,
      oneStar: reviewStats.oneStar,
    },
    financials: {
      totalEarnings,
      totalSpending: totalEarnings,
      totalMilestonePayments,
    },
  };
};
