import express from "express";
import {
  createMilestone,
  getProjectMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
  updateMilestoneStatus,
} from "../controllers/milestone.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Create milestone (Client/Admin)
router.post("/", verifyToken, createMilestone);

// Get all milestones of a project
router.get("/project/:projectId", verifyToken, getProjectMilestones);

// Get single milestone
router.get("/:id", verifyToken, getMilestoneById);

// Update milestone details
router.put("/:id", verifyToken, updateMilestone);

// Update only milestone status
router.patch("/:id/status", verifyToken, updateMilestoneStatus);

// Delete milestone
router.delete("/:id", verifyToken, deleteMilestone);

export default router;