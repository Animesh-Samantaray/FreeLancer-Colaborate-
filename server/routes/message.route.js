import express from "express";
import {
  sendMessage,
  getConversationMessages,
  markMessageAsRead,
  deleteMessage,
  reactToMessage
} from "../controllers/message.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import upload from '../middlewares/upload.middleware.js';


const router = express.Router();

router.post(
  "/:conversationId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed.",
        });
      }
      next();
    });
  },
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

router.patch(
  "/:messageId/reaction",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  reactToMessage
);

export default router;