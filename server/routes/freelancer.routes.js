import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getFreelancerProfile,
  updateFreelancerProfile,
  getAllFreelancers,
  getFreelancerById,
} from "../controllers/freelancer.controller.js";

const router = express.Router();

// Public (authenticated users)
router.get("/", authMiddleware, getAllFreelancers);
router.get("/:id", authMiddleware, getFreelancerById);

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

export default router;