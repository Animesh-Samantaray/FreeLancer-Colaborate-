import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import invoiceRoutes from "./routes/invoice.route.js";
import dns from "dns";
import projectRoutes from './routes/project.route.js';
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import freelancerRoutes from "./routes/freelancer.routes.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import proposalRoutes from "./routes/proposal.route.js";
import invitationRoutes from "./routes/invitation.route.js";
import aiRoutes from './routes/ai.route.js';
import milestoneRoutes from "./routes/milestone.route.js";
import taskRoutes from './routes/task.route.js';
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import reviewRoutes from "./routes/review.route.js";
import userRoutes from "./routes/user.route.js";
import reportsRoutes from "./routes/reports.route.js";
import paymentRoutes from "./routes/payment.route.js";

import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./configs/socket.js";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

initializeSocket(io);
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/proposal", proposalRoutes);
app.use("/api/invitation", invitationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/milestone", milestoneRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/invoices", invoiceRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Testing Tool Backend Running 🚀",
  });
});


const PORT = process.env.PORT || 5000;



server.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT} \n Socket connected`);
});