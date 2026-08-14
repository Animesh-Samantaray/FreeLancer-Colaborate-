import express from "express";

import {
  createPaymentOrder,
  verifyPayment,
  getPaymentById,
  getMyPayments,
} from "../controllers/payment.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";

const router = express.Router();

// Create Razorpay order
router.post(
  "/create-order",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  createPaymentOrder
);

// Verify Razorpay payment
router.post(
  "/verify",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  verifyPayment
);

// Get single payment
router.get(
  "/:paymentId",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getPaymentById
);

// Get logged-in user's payments
router.get(
  "/my-payments",
  authMiddleware,
  authorizeRoles("client", "freelancer", "admin"),
  getMyPayments
);

export default router;