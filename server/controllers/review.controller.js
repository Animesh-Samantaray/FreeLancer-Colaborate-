import Review from "../models/Review.model.js";
import FreelancerProfile from "../models/FreelancerProfile.model.js";
import Project from "../models/Project.model.js";

export const createReview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment } = req.body;
    const clientId = req.user.id;

   
    if (!rating) {
      return res.status(400).json({
        success: false,
        message: "Rating is required.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

   
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Review only completed projects
    if (project.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed projects.",
      });
    }

    // Check whether client belongs to this project
    if (
      project.client &&
      project.client.toString() !== clientId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this project.",
      });
    }

    // Get freelancer from project
    if (!project.freelancers || project.freelancers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No freelancer found for this project.",
      });
    }

    
    const freelancerId = project.freelancers[0];

    // Check if client already reviewed this project
    const existingReview = await Review.findOne({
      client: clientId,
      project: projectId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this project.",
      });
    }

    // Create review
    const review = await Review.create({
      freelancer: freelancerId,
      client: clientId,
      project: projectId,
      rating,
      comment: comment || "",
    });

    // Get all reviews of this freelancer
    const reviews = await Review.find({
      freelancer: freelancerId,
    });

    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0;

    // Update freelancer profile
    await FreelancerProfile.findOneAndUpdate(
      { user: freelancerId },
      {
        averageRating,
        totalReviews,
      }
    );

    // Populate client information
    const populatedReview = await Review.findById(review._id)
      .populate("client", "fullName avatar")
      .populate("freelancer", "fullName avatar")
      .populate("project", "title");

    return res.status(201).json({
      success: true,
      message: "Review created successfully.",
      review: populatedReview,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};



export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    const reviews = await Review.find({
      freelancer: freelancerId,
    })
      .populate("client", "fullName avatar")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get Freelancer Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};