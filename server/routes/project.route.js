import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  deleteAllProjects,
} from "../controllers/project.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createProject);

router.get("/", authMiddleware, getAllProjects);

router.get("/:id", authMiddleware, getProjectById);

router.put("/:id", authMiddleware, updateProject);

router.delete("/:id", authMiddleware, deleteProject);

//  (Admin only)
router.delete("/", authMiddleware, deleteAllProjects);

export default router;