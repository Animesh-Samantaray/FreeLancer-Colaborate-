import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getClientProfile,
  updateClientProfile,
  getAllClients,
  getClientById,
} from "../controllers/client.controller.js";

const router = express.Router();

// Logged-in client
router.get(
  "/profile",
  authMiddleware,
  authorizeRoles("client"),
  getClientProfile
);

router.put(
  "/profile",
  authMiddleware,
  authorizeRoles("client","admin"),
  updateClientProfile
);

// Public client profile 
router.get(
  "/:id",
  authMiddleware,
  getClientById
);

// Admin only
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getAllClients
);

export default router;