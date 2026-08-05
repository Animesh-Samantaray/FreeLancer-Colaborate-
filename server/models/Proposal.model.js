import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: {
      type: String,
      required: true,
      trim: true,
    },

    bidAmount: {
      type: Number,
      required: true,
    },

    estimatedDays: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Withdrawn",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index(
  {
    project: 1,
    freelancer: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Proposal", proposalSchema);