import express from "express";
import cors from "cors";
import { createServer } from "http";
import connectToSocket from "./src/controllers/socketManager.js";

import authRouter from "./src/routes/authRouter.js";
import meetingRouter from "./src/routes/meetingRouter.js";

const app = express();

const server = createServer(app);

app.use(cors({
    origin: "http://localhost:5173",
}));

app.use(express.json());

app.use("/auth", authRouter);
app.use("/meeting", meetingRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is running",
    });
});

connectToSocket(server);

export { app, server };