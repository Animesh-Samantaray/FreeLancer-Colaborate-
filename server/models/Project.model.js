import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "",
    },

    requiredSkills: [
      {
        type: String,
      },
    ],

    budget: {
      type: Number,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "Hiring",
        "Hired",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Open",
    },

    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },
     milestones: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Milestone",
      },
    ]
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);