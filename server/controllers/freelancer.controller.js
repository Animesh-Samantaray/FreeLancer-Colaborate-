import FreelancerProfile from "../models/FreelancerProfile.model.js";

export const getAllFreelancers = async (req, res) => {
  try {
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

    const freelancer = await FreelancerProfile.findOne({
      user: userId,
    }).populate("user", "fullName email avatar role");

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found.",
      });
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



export const updateFreelancerProfile = async(req , res)=>{
  try {
    const user = req.user;
    const  freelancer = await FreelancerProfile.findOne({user:user.id});
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found.",
      });
    }
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

    if (professionalTitle !== undefined)
      freelancer.professionalTitle = professionalTitle;

    if (bio !== undefined)
      freelancer.bio = bio;

    if (skills !== undefined)
      freelancer.skills = skills;

    if (experience !== undefined)
      freelancer.experience = experience;

    if (hourlyRate !== undefined)
      freelancer.hourlyRate = hourlyRate;

    if (location !== undefined)
      freelancer.location = location;

    if (languages !== undefined)
      freelancer.languages = languages;

    if (github !== undefined)
      freelancer.github = github;

    if (linkedin !== undefined)
      freelancer.linkedin = linkedin;

    if (website !== undefined)
      freelancer.website = website;

    if (portfolio !== undefined)
      freelancer.portfolio = portfolio;

    if (resume !== undefined)
      freelancer.resume = resume;

    if (availability !== undefined)
      freelancer.availability = availability;
    
      return res.status(200).json({
      success: true,
      message: "Freelancer profile updated successfully.",
      freelancer,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}