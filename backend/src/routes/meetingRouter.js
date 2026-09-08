import express from "express";
import auth from "../middlewares/auth.js";
import { createMeeting, getHistory } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/create", auth, createMeeting);
router.get("/history", auth, getHistory);

export default router;