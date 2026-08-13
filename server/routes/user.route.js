import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Admin only
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  getUserById
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createUser
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  updateUser
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteUser
);

export default router;