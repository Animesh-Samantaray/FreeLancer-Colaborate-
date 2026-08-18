import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    badge: {
      type: String,
      enum: [
        // Freelancer badges
        "TOP_RATED_FREELANCER",
        "ELITE_FREELANCER",
        "RELIABLE_PROFESSIONAL",
        "HIGH_EARNER",
        "EXPERIENCED_FREELANCER",
        "HIGHLY_RECOMMENDED",

        // Client badges
        "TRUSTED_CLIENT",
        "PREMIUM_CLIENT",
        "TOP_RATED_CLIENT",
        "RELIABLE_EMPLOYER",
        "PREFERRED_CLIENT",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);


achievementSchema.index(
  {
    user: 1,
    badge: 1,
  },
  {
    unique: true,
  }
);

const Achievement = mongoose.model(
  "Achievement",
  achievementSchema
);

export default Achievement;