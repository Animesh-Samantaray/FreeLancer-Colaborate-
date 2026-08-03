import mongoose from "mongoose";

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    professionalTitle: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    skills: [
      {
        type: String,
      },
    ],

    experience: {
      type: Number,
      default: 0, 
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
    },

    languages: [
      {
        type: String,
      },
    ],

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    portfolio: [
      {
        title: String,
        link: String,
      },
    ],

    resume: {
      type: String,
      default: "",
    },

    availability: {
      type: String,
      enum: ["Available", "Busy"],
      default: "Available",
    },

    completedProjects: {
      type: Number,
      default: 0,
    },

    ongoingProjects: {
      type: Number,
      default: 0,
    },

    totalHoursWorked: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
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
  "FreelancerProfile",
  freelancerProfileSchema
);