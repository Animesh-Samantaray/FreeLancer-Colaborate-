import ClientProfile from "../models/ClientProfile.model.js";

export const getClientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await ClientProfile.findOne({ user: userId }).populate(
      "user",
      "fullName email avatar role"
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }

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

    const profile = await ClientProfile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Client profile not found.",
      });
    }

    const {
      companyName,
      companyDescription,
      industry,
      website,
      location,
      companyLogo,
    } = req.body;

    if (companyName !== undefined)
      profile.companyName = companyName;

    if (companyDescription !== undefined)
      profile.companyDescription = companyDescription;

    if (industry !== undefined)
      profile.industry = industry;

    if (website !== undefined)
      profile.website = website;

    if (location !== undefined)
      profile.location = location;

    if (companyLogo !== undefined)
      profile.companyLogo = companyLogo;

    await profile.save();

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