import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  createReview,
  getFreelancerReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

// Client creates a review for a completed project
router.post(
  "/project/:projectId",
  authMiddleware,
  authorizeRoles("client"),
  createReview
);

// Get all reviews of a freelancer
router.get(
  "/freelancer/:freelancerId",
  authMiddleware,
  getFreelancerReviews
);

export default router;