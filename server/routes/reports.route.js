import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/role.middleware.js";
import {
  getWeeklyReport,
  getMonthlyReport,
  getCustomReport,
} from "../controllers/reports.controller.js";

const router = express.Router();


router.use(authMiddleware);
router.use(authorizeRoles("admin"));

router.get("/weekly", getWeeklyReport);
router.get("/monthly", getMonthlyReport);
router.get("/custom", getCustomReport);

export default router;
