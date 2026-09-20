const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const prisma = require("./config/prisma");

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://task-management-frontend-88qmkvf87-adithyas-projects-e20db2dd.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authMiddleware = require("./middleware/authmiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);