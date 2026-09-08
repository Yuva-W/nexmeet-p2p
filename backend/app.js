import express from "express";
import cors from "cors";
import { createServer } from "http";
import connectToSocket from "./src/controllers/socketManager.js";

import authRouter from "./src/routes/authRouter.js";
import meetingRouter from "./src/routes/meetingRouter.js";

const app = express();

const server = createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: clientUrl,
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/auth", authRouter);
app.use("/meeting", meetingRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
    });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

connectToSocket(server);

export { app, server };