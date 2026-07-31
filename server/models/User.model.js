import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    // Authentication
    password: {
      type: String,
      minlength: 6,
      required: function () {
        return !this.googleId;
      },
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // User Role
    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "freelancer",
    },

    // Email Verification
    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationOTP: String,

    emailVerificationOTPExpire: Date,

    // Forgot Password
    passwordResetOTP: String,

    passwordResetOTPExpire: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;