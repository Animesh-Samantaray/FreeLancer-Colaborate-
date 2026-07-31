import express from "express";
import passport from "../configs/passport.js";

import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import generateToken from "../helper/generateToken.js";

const router = express.Router();

// Authentication
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

// User
router.get("/me", authMiddleware, getMe);

// Email Verification
// router.post("/send-verification-otp", sendVerificationOTP);
// router.post("/verify-email", verifyEmail);

// Google Authentication
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
    session: false,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          `${process.env.CLIENT_URL || "http://localhost:5173"}/login`
        );
      }

      // Set provider for Google accounts
      req.user.authProvider = "google";
      req.user.isVerified = true;
      await req.user.save();

      const token = generateToken(req.user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}`
      );
    } catch (error) {
      console.error("Google OAuth Error:", error);

      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login`
      );
    }
  }
);

export default router;