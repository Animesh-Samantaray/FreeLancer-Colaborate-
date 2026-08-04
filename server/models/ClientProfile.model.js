import mongoose from "mongoose";

const clientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: {
      type: String,
      default: "",
    },

    companyDescription: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    companyLogo: {
      type: String,
      default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTRN4lHm8tjxvp85npV2YpZzBw8moqQPMzsuJZI0Gj9w&s=10",
    },

    totalProjects: {
      type: Number,
      default: 0,
    },

    activeProjects: {
      type: Number,
      default: 0,
    },

    completedProjects: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ClientProfile",
  clientProfileSchema
);