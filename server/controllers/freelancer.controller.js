import FreelancerProfile from "../models/FreelancerProfile.model.js";
import User from "../models/User.model.js";
import Project from "../models/Project.model.js";
import Proposal from "../models/Proposal.model.js";
import Invitation from "../models/Invitation.model.js";
import { uploadToCloudinary, deleteFromCloudinary, extractCloudinaryMetadata } from "../utils/cloudinaryUpload.js";
import { extractResumeText } from "../services/resume.service.js";
import { askGroqModel } from "../services/ai.service.js";

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
      freelancers: formatFreelancersList(req, freelancers),
    });
  } catch (error) {
    console.error("Get All Freelancers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getFreelancerById = async (req, res) => {
  try {
    const id = req.params.id;
    const freelancer = await FreelancerProfile.findById(id).populate("user", "fullName avatar role")
    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found"
      })
    }
    return res.status(200).json({
      success: true,
      freelancer: formatFreelancerResponse(req, freelancer),
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

    let freelancer = await FreelancerProfile.findOne({ user: userId });

    if (!freelancer) {
      // Create a default profile on demand if one doesn't exist
      freelancer = await FreelancerProfile.create({ user: userId });
    }

    const freelancerIdSet = new Set([userId.toString()]);
    if (freelancer._id) {
      freelancerIdSet.add(freelancer._id.toString());
    }
    const freelancerIds = Array.from(freelancerIdSet);

    // Find project IDs where freelancer's proposal was accepted
    const acceptedProposals = await Proposal.find({
      freelancer: { $in: freelancerIds },
      status: "Accepted",
    }).select("project");

    // Find project IDs where freelancer's invitation was accepted
    const acceptedInvitations = await Invitation.find({
      freelancer: { $in: freelancerIds },
      status: "Accepted",
    }).select("project");

    const acceptedProjectIds = [
      ...acceptedProposals.map((p) => p.project),
      ...acceptedInvitations.map((i) => i.project),
    ];

    // Query condition for any project belonging to this freelancer
    const freelancerProjectsCondition = {
      $or: [
        { freelancers: { $in: freelancerIds } },
        { _id: { $in: acceptedProjectIds } },
      ],
    };

    // Calculate real-time accurate statistics directly from database
    const completedProjects = await Project.countDocuments({
      ...freelancerProjectsCondition,
      status: "Completed",
    });

    const ongoingProjects = await Project.countDocuments({
      ...freelancerProjectsCondition,
      status: { $in: ["Hired", "In Progress", "Open", "Hiring"] },
    });

    freelancer.ongoingProjects = ongoingProjects;
    freelancer.completedProjects = completedProjects;
    if (ongoingProjects > 0 && freelancer.availability === "Available") {
      freelancer.availability = "Busy";
    }
    await freelancer.save();

    freelancer = await FreelancerProfile.findOne({ user: userId }).populate(
      "user",
      "fullName email avatar role"
    );

    return res.status(200).json({
      success: true,
      freelancer: formatFreelancerResponse(req, freelancer),
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
    if (availability !== undefined) updateData.availability = availability;

    const freelancer = await FreelancerProfile.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).populate("user", "fullName email avatar role");

    return res.status(200).json({
      success: true,
      message: "Freelancer profile updated successfully.",
      freelancer: formatFreelancerResponse(req, freelancer),
    });
  } catch (error) {
    console.error("Update Freelancer Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({
      freelancers: userId,
    })
      .populate("client", "fullName avatar")
      .populate("freelancers", "fullName avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get My Projects Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const isProfileCompleted = async (req, res) => {
  try {
    const userId = req.user.id;

    const freelancer = await FreelancerProfile.findOne({
      user: userId,
    });

   
    if (!freelancer) {
      return res.status(200).json({
        success: true,
        profileCompleted: false,
      });
    }

    const hasResume = Boolean(freelancer.resume?.trim());

    const hasPortfolio =
      Array.isArray(freelancer.portfolio) &&
      freelancer.portfolio.some(
        (item) => item?.title?.trim() && item?.link?.trim()
      );

    const profileCompleted = hasResume && hasPortfolio;

    return res.status(200).json({
      success: true,
      profileCompleted,
    });
  } catch (error) {
    console.error("Check Freelancer Profile Completion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check profile completion.",
    });
  }
};



export const uploadFreelancerResume = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF and DOCX resumes are supported.",
      });
    }

    // Extract resume text before/independently of Cloudinary storage.
    const resumeData = await extractResumeText(req.file);

    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to extract text from the resume. Please upload a readable PDF or DOCX file.",
      });
    }

    // Fetch current profile to get old resume details before uploading new one
    const existingProfile = await FreelancerProfile.findOne({ user: userId });
    const oldResumeUrl = existingProfile?.resume;
    const oldPublicId = existingProfile?.resumePublicId;
    const oldResourceType = existingProfile?.resumeResourceType;

    // Upload resume to Cloudinary.
    const cloudinaryResult = await uploadToCloudinary(
      req.file,
      "freelancer-platform/resumes"
    );

    if (!cloudinaryResult?.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Resume upload failed.",
      });
    }

    const freelancer = await FreelancerProfile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          resume: cloudinaryResult.secure_url,
          resumePublicId: cloudinaryResult.public_id,
          resumeResourceType: cloudinaryResult.resource_type,
          resumeOriginalName: req.file.originalname,
          resumeMimeType: req.file.mimetype,
          resumeFormat: cloudinaryResult.format,
          resumeData,
          resumeUpdatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate("user", "fullName email avatar role");

    // Clean up old Cloudinary file now that new upload is stored in DB
    if (oldResumeUrl) {
      let deletePublicId = oldPublicId;
      let deleteResourceType = oldResourceType;

      if (!deletePublicId) {
        // Fallback: parse from URL if metadata wasn't stored in the database yet
        const parsed = extractCloudinaryMetadata(oldResumeUrl);
        if (parsed) {
          deletePublicId = parsed.publicId;
          deleteResourceType = parsed.resourceType;
        }
      }

      if (deletePublicId) {
        console.log(`🧹 Deleting old resume from Cloudinary: ${deletePublicId} (${deleteResourceType || "raw"})...`);
        try {
          await deleteFromCloudinary(deletePublicId, deleteResourceType || "raw");
        } catch (cleanupError) {
          console.error("Failed to clean up old Cloudinary resume file:", cleanupError);
        }
      }
    }

    const formattedFreelancer = formatFreelancerResponse(req, freelancer);
    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      resume: formattedFreelancer.resume,
      resumeMetadata: {
        url: freelancer.resume,
        publicId: freelancer.resumePublicId,
        resourceType: freelancer.resumeResourceType,
        originalName: freelancer.resumeOriginalName,
        mimeType: freelancer.resumeMimeType,
        format: freelancer.resumeFormat,
      },
      resumeUpdatedAt: freelancer.resumeUpdatedAt,
      freelancer: formattedFreelancer,
    });
  } catch (error) {
    console.error("Upload Freelancer Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume.",
    });
  }
};



export const analyzeFreelancerProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const freelancer = await FreelancerProfile.findOne({ user: userId });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found.",
      });
    }

    if (!freelancer.resumeData?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please upload your resume file (PDF/DOCX) first to run AI profile analysis.",
      });
    }

    const prompt = `You are an expert technical recruiter and resume reviewer.
Analyze the following freelancer's profile and extracted resume text.
Provide an objective evaluation including a completeness score, strengths, improvements (weaknesses), and actionable suggestions.

Profile Details:
- Title: ${freelancer.professionalTitle || "Not set"}
- Bio: ${freelancer.bio || "Not set"}
- Skills: ${freelancer.skills?.join(", ") || "None listed"}
- Experience: ${freelancer.experience || 0} years
- Hourly Rate: $${freelancer.hourlyRate || 0}/hr
- Portfolio Projects: ${JSON.stringify(freelancer.portfolio || [])}

Extracted Resume Text:
${freelancer.resumeData}

Based on this information, generate an analysis in JSON format.
The JSON object MUST contain exactly these fields:
1. "overallScore": A number from 0 to 100 representing the completeness and quality of the profile.
2. "strengths": An array of strings highlighting the key professional strengths.
3. "improvements": An array of strings pointing out gaps, inconsistencies, or areas of improvement in the profile or resume.
4. "suggestions": An array of strings detailing concrete steps the freelancer can take to improve their profile/resume and attract more clients.
5. "feedback": A brief summary paragraph of the analysis.

Do not include any other fields. Return ONLY a valid JSON object. Do not include markdown code block syntax.`;

    // Updated to call Grok instead of Gemini
    const rawResponse = await askGroqModel(prompt);
    
    // Clean and parse JSON response
    let cleanedResponse = rawResponse.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```(?:json)?\n?/i, "")
        .replace(/\n?```$/, "");
    }
    cleanedResponse = cleanedResponse.trim();

    let analysisData;
    try {
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Grok response as JSON:", rawResponse);
      return res.status(500).json({
        success: false,
        message: "AI returned a malformed response. Please try again.",
      });
    }

    // Append to aiProfileAnalysis list
    const newAnalysis = {
      overallScore: Number(analysisData.overallScore) || 0,
      result: analysisData,
      analyzedAt: new Date(),
    };

    freelancer.aiProfileAnalysis.push(newAnalysis);
    await freelancer.save();

    return res.status(200).json({
      success: true,
      message: "AI Profile Analysis completed successfully.",
      analysis: newAnalysis,
    });
  } catch (error) {
    console.error("Analyze Freelancer Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to run AI profile analysis.",
    });
  }
};

export const downloadFreelancerResumeFile = async (req, res) => {
  try {
    const { id } = req.params;
    const freelancer = await FreelancerProfile.findById(id);
    if (!freelancer || !freelancer.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found.",
      });
    }

    let publicId = freelancer.resumePublicId;
    let resourceType = freelancer.resumeResourceType || "raw";

    if (!publicId) {
      const parsed = extractCloudinaryMetadata(freelancer.resume);
      if (parsed) {
        publicId = parsed.publicId;
        resourceType = parsed.resourceType;
      }
    }

    if (!publicId) {
      return res.redirect(freelancer.resume);
    }

    const path = (await import("path")).default;
    const ext = path.extname(freelancer.resumeOriginalName || freelancer.resume).replace(".", "") || "pdf";

    const { default: cloudinary } = await import("../configs/cloudinary.js");
    const signedUrl = cloudinary.utils.private_download_url(publicId, ext, {
      resource_type: resourceType,
      type: "upload",
      expires_at: Math.floor(Date.now() / 1000) + 600,
    });

    const axios = (await import("axios")).default;
    const response = await axios.get(signedUrl, { responseType: "stream" });

    res.setHeader("Content-Type", freelancer.resumeMimeType || "application/pdf");
    const filename = freelancer.resumeOriginalName || `resume-${id}.${ext}`;
    const download = req.query.download === "true";
    res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${filename}"`);

    response.data.pipe(res);
  } catch (error) {
    console.error("Download Freelancer Resume Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download resume.",
    });
  }
};

export const formatFreelancerResponse = (req, freelancerDoc) => {
  if (!freelancerDoc) return null;
  const freelancer = freelancerDoc.toObject ? freelancerDoc.toObject({ virtuals: true }) : { ...freelancerDoc };
  if (freelancer.resume) {
    freelancer.resume = `${req.protocol}://${req.get("host")}/api/freelancer/${freelancer._id}/resume/download`;
  }
  return freelancer;
};

export const formatFreelancersList = (req, freelancersList) => {
  if (!freelancersList || !Array.isArray(freelancersList)) return [];
  return freelancersList.map((f) => formatFreelancerResponse(req, f));
};