import express from "express";
import cors from "cors";
import {createServer} from 'node:http';

import connectToSocket from "./src/controllers/socketManager.js";
import authRouter from "./src/routes/authRouter.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use(cors());

app.use("/auth",authRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "this is home directory"
    });
})

export default app;