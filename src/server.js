const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const prisma = require("./config/prisma");

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://task-management-frontend-lilac.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin
            // (Postman, server-to-server requests, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// Parse JSON request bodies
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const authMiddleware = require("./middleware/authmiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Test/root route
app.get("/", async (req, res) => {
    try {
        const userCount = await prisma.user.count();

        res.json({
            message: "Task Management API is running",
            database: "Connected",
            users: userCount
        });
    } catch (error) {
        console.error("DATABASE ERROR:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// Protected route
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});

// Local development server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;