import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getFreelancerProfile,
  updateFreelancerProfile,
  getAllFreelancers,
  getFreelancerById,
  getMyProjects,
  isProfileCompleted,
} from "../controllers/freelancer.controller.js";

const router = express.Router();

// Logged-in freelancer
router.get(
  "/profile",
  authMiddleware,
  authorizeRoles("freelancer","admin"),
  getFreelancerProfile
);

router.put(
  "/profile",
  authMiddleware,
  authorizeRoles("freelancer","admin"),
  updateFreelancerProfile
);

router.get(
  "/my-projects",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  getMyProjects
);

router.get(
  "/profile/completion",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  isProfileCompleted
);

// Public (authenticated users)
router.get("/", authMiddleware, getAllFreelancers);
router.get("/:id", authMiddleware, getFreelancerById);

export default router;