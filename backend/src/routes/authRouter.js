import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.js";
import { User } from "../models/userModel.js";

import { 
    register,
    login
 } from "../controllers/authController.js";

const router = Router();

// Rate limiting for public auth endpoints - prevents brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

export default router;