import express from "express";
import auth from "../middlewares/auth.js";
import { createMeeting, getHistory, getMeetingByCode } from "../controllers/meetingController.js";

const router = express.Router();

router.post("/create", auth, createMeeting);
router.get("/history", auth, getHistory);
router.get("/:code", auth, getMeetingByCode);

export default router;