import express from "express";
import auth from "../middlewares/auth.js";
import { createMeeting } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/create", auth, createMeeting);

export default router;