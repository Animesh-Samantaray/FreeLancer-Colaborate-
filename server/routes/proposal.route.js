import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  createProposal,
  getMyProposals,
  getProjectProposals,
  updateProposal,
  deleteProposal,
} from "../controllers/proposal.controller.js";

const router = express.Router();

// Freelancer submits a proposal
router.post(
  "/",
  authMiddleware,
  authorizeRoles("freelancer"),
  createProposal
);

//  freelancer views all of their proposals
router.get(
  "/my",
  authMiddleware,
  authorizeRoles("freelancer"),
  getMyProposals
);

// Client views proposals for  own projects
router.get(
  "/project/:projectId",
  authMiddleware,
  authorizeRoles("client", "admin"),
  getProjectProposals
);

// Client accepts or rejects a proposal
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("client", "admin"),
  updateProposal
);

// Freelancer withdraws proposal or Admin deletes it
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("freelancer", "admin"),
  deleteProposal
);

export default router;