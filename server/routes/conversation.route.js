import express from "express";

import {
  createConversation,
  getProjectConversation,
  getMyConversations
} from "../controllers/conversation.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getMyConversations
);

router.post(
  "/project/:projectId",
  authMiddleware,
  authorizeRoles("client", "admin"),
  createConversation
);

router.get(
  "/project/:projectId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getProjectConversation
);

export default router;