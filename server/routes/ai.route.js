import express from "express";
import { askAI } from "../controllers/ai.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post(
  "/chat",
  authMiddleware,
  askAI
);
export default router;