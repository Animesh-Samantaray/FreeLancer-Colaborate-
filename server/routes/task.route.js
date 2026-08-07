import express from "express";

import {
  createTask,
  getMilestoneTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// Create Task 
router.post(
  "/",
  authMiddleware,
  authorizeRoles("client", "admin"),
  createTask
);

// Get all tasks of a milestone 
router.get(
  "/milestone/:milestoneId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getMilestoneTasks
);

// Get single task 
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getTaskById
);

// Update task details 
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("client", "admin"),
  updateTask
);

// Update task status 
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  updateTaskStatus
);

// Delete task 
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("client", "admin"),
  deleteTask
);

export default router;