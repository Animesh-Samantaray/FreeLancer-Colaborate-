import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";

import userRoutes from './routes/user.routes.js';
import aiRoutes from './routes/ai.route.js';

import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "./middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

app.use("/api/user", userRoutes);
app.use("/api/ai" ,  aiRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Testing Tool Backend Running 🚀",
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);
});