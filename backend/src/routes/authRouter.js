import { Router } from "express";
import auth from "../middlewares/auth.js";
import { User } from "../models/userModel.js";

import { 
    register,
    login
 } from "../controllers/authController.js";

const router = Router();

router.post("/register",register);
router.post("/login",login);

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
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

export default router;