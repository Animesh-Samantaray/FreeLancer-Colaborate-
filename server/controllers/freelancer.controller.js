import FreelancerProfile from "../models/FreelancerProfile.model.js";
import User from "../models/User.model.js";

export const getAllFreelancers = async (req, res) => {
  try {
    // Find all users with role 'freelancer'
    const freelancerUsers = await User.find({ role: "freelancer" });

    // Find all existing freelancer profiles
    const existingProfiles = await FreelancerProfile.find();
    const existingUserIds = new Set(
      existingProfiles
        .filter(p => p && p.user)
        .map(p => p.user.toString())
    );

    // Find users who don't have profiles
    const missingProfiles = freelancerUsers.filter(u => !existingUserIds.has(u._id.toString()));

    if (missingProfiles.length > 0) {
      // Create missing profiles in bulk
      const newProfiles = missingProfiles.map(u => ({ user: u._id }));
      await FreelancerProfile.insertMany(newProfiles);
    }

    const freelancers = await FreelancerProfile.find()
      .populate("user", "fullName avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: freelancers.length,
      freelancers,
    });
  } catch (error) {
    console.error("Get All Freelancers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getFreelancerById=async(req,res)=>{
    try {
        const id=req.query.id;
        const freelancer = await FreelancerProfile.findById(id).populate("user","fullName avatar role")
        if(!freelancer){
            return res.status(404).json({
                success:false,
                message:"Freelancer not found"
            })
        }
        return res.status(200).json({
            success:true,
            freelancer,
        })
    } catch (error) {
        console.error("Get Freelancer By Id Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}



export const getFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    let freelancer = await FreelancerProfile.findOne({
      user: userId,
    }).populate("user", "fullName email avatar role");

    if (!freelancer) {
      // Create a default profile on demand if one doesn't exist
      await FreelancerProfile.create({ user: userId });
      freelancer = await FreelancerProfile.findOne({
        user: userId,
      }).populate("user", "fullName email avatar role");
    }

    return res.status(200).json({
      success: true,
      freelancer,
    });
  } catch (error) {
    console.error("Get Freelancer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const updateFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      professionalTitle,
      bio,
      skills,
      experience,
      hourlyRate,
      location,
      languages,
      github,
      linkedin,
      website,
      portfolio,
      resume,
      availability,
    } = req.body;

    const updateData = {};
    if (professionalTitle !== undefined) updateData.professionalTitle = professionalTitle;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (experience !== undefined) updateData.experience = experience;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (location !== undefined) updateData.location = location;
    if (languages !== undefined) updateData.languages = languages;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (website !== undefined) updateData.website = website;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (resume !== undefined) updateData.resume = resume;
    if (availability !== undefined) updateData.availability = availability;

    const freelancer = await FreelancerProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("user", "fullName email avatar role");

    return res.status(200).json({
      success: true,
      message: "Freelancer profile updated successfully.",
      freelancer,
    });
  } catch (error) {
    console.error("Update Freelancer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};