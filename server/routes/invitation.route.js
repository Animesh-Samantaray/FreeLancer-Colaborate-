import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  createInvitation,
  getMyInvitations,
  getProjectInvitations,
  updateInvitation,
  deleteInvitation,
} from "../controllers/invitation.controller.js";

const router = express.Router();



// Send invitation to a freelancer
router.post(
  "/",
  authMiddleware,
  authorizeRoles("client"),
  createInvitation
);

// View invitations sent for a project
router.get(
  "/project/:projectId",
  authMiddleware,
  authorizeRoles("client", "admin"),
  getProjectInvitations
);

// Withdraw/Delete invitation
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("client", "admin"),
  deleteInvitation
);



// View my invitations
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("freelancer"),
  getMyInvitations
);

// Accept / Reject invitation
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("freelancer"),
  updateInvitation
);

export default router;