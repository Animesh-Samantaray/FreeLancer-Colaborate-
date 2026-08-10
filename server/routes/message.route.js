import express from "express";
import {
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
  deleteMessage,
} from "../controllers/message.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import upload from '../middlewares/upload.middleware.js';


const router = express.Router();

router.post(
  "/:conversationId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  upload.single("file"),
  sendMessage
);

router.get(
  "/:conversationId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getConversationMessages
);

router.patch(
  "/:messageId/read",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  markMessageAsRead
);

router.patch(
  "/read/:messageId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  markMessageAsRead
);

router.delete(
  "/:messageId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  deleteMessage
);

export default router;