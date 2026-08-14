import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

import {
  createInvoice,
  getInvoiceById,
  getMyInvoices,
} from "../controllers/invoice.controller.js";

const router = express.Router();

// Create invoice
router.post(
  "/create",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  createInvoice
);

// Get logged-in user's invoices
router.get(
  "/my-invoices",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getMyInvoices
);

// Get single invoice
router.get(
  "/:invoiceId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getInvoiceById
);

export default router;