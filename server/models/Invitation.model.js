import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Withdrawn"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);


invitationSchema.index(
  {
    project: 1,
    freelancer: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("Invitation", invitationSchema);