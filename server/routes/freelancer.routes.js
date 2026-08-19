import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getFreelancerProfile,
  updateFreelancerProfile,
  getAllFreelancers,
  getFreelancerById,
  getMyProjects,
  isProfileCompleted,
  uploadFreelancerResume,
  analyzeFreelancerProfile,
  downloadFreelancerResumeFile,
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


router.post(
  "/profile/resume",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  upload.single("resume"),
  uploadFreelancerResume
);

router.post(
  "/profile/analyze",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  analyzeFreelancerProfile
);

// Public (authenticated users)
router.get("/", authMiddleware, getAllFreelancers);
router.get("/:id", authMiddleware, getFreelancerById);
router.get("/:id/resume/download", authMiddleware, downloadFreelancerResumeFile);

export default router;