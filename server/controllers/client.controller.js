import ClientProfile from "../models/ClientProfile.model.js";
import User from "../models/User.model.js";
import Project from "../models/Project.model.js";

export const getClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await ClientProfile.findOne({ user: userId });

    if (!profile) {
      // Create a default profile on demand if one doesn't exist
      profile = await ClientProfile.create({ user: userId });
    }

    // Calculate real-time accurate statistics directly from database
    const totalProjects = await Project.countDocuments({ client: userId });
    const activeProjects = await Project.countDocuments({
      client: userId,
      status: { $in: ["Open", "Hiring", "Hired", "In Progress"] },
    });
    const completedProjects = await Project.countDocuments({
      client: userId,
      status: "Completed",
    });

    // Calculate total freelancers hired across client's projects
    const clientProjects = await Project.find({ client: userId }).select("freelancers");
    const hiredFreelancerIds = new Set();
    clientProjects.forEach((p) => {
      if (Array.isArray(p.freelancers)) {
        p.freelancers.forEach((fId) => hiredFreelancerIds.add(fId.toString()));
      }
    });
    const totalHires = hiredFreelancerIds.size;

    // Synchronize profile counters
    profile.totalProjects = totalProjects;
    profile.activeProjects = activeProjects;
    profile.completedProjects = completedProjects;
    profile.totalHires = totalHires;
    await profile.save();

    profile = await ClientProfile.findOne({ user: userId }).populate(
      "user",
      "fullName email avatar role"
    );

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get Client Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      companyName,
      companyDescription,
      industry,
      website,
      location,
      companyLogo,
    } = req.body;

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
    if (industry !== undefined) updateData.industry = industry;
    if (website !== undefined) updateData.website = website;
    if (location !== undefined) updateData.location = location;
    if (companyLogo !== undefined) updateData.companyLogo = companyLogo;

    const profile = await ClientProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).populate("user", "fullName email avatar role");

    return res.status(200).json({
      success: true,
      message: "Client profile updated successfully.",
      profile,
    });
  } catch (error) {
    console.error("Update Client Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAllClients = async (req, res) => {
  try {
    // Find all users with role 'client'
    const clientUsers = await User.find({ role: "client" });

    // Find all existing client profiles
    const existingProfiles = await ClientProfile.find();
    const existingUserIds = new Set(
      existingProfiles
        .filter(p => p && p.user)
        .map(p => p.user.toString())
    );

    // Find users who don't have profiles
    const missingProfiles = clientUsers.filter(u => !existingUserIds.has(u._id.toString()));

    if (missingProfiles.length > 0) {
      // Create missing profiles in bulk
      const newProfiles = missingProfiles.map(u => ({ user: u._id }));
      await ClientProfile.insertMany(newProfiles);
    }

    const clients = await ClientProfile.find()
      .populate("user", "fullName email avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Get All Clients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;

    const client = await ClientProfile.findById(clientId).populate(
      "user",
      "fullName email avatar role"
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Get Client By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};