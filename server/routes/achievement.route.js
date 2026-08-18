import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getMyAchievements,
  getUserAchievements,
} from "../controllers/achievement.controller.js";

const router = express.Router();

// Get logged-in user's achievements
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getMyAchievements
);

// Get another user's achievements
router.get(
  "/user/:userId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getUserAchievements
);

export default router;