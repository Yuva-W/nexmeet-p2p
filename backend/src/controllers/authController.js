import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status"
import { User } from "../models/userModel.js";

const register = async (req, res) => {
    try {
        const {name, username, password} = req.body;

        // Backend validation - don't trust frontend
        if (!name || !name.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Name is required"
            });
        }

        if (!username || !username.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Username is required"
            });
        }

        if (!password || password.length < 6) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const trimmedUsername = username.trim().toLowerCase();

        const existingUser = await User.findOne({ username: trimmedUsername });

        if (existingUser){
            return res.status(httpStatus.CONFLICT).json({
                success: false,
                message: "User already exists"
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            username: trimmedUsername,
            password: hashedPassword
        });

        return res.status(httpStatus.OK).json({
            success: true,
            message: "User Registered successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error(`register error: ${error.message}`);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    }

};

const login = async (req, res) => {
    try {
        const { username, password} = req.body;

        if (!username || !username.trim()) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Username is required"
            });
        }

        if (!password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Password is required"
            });
        }

        const trimmedUsername = username.trim().toLowerCase();
        const user = await User.findOne({ username: trimmedUsername });

        if (!user){
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                token
            }
        });
    } catch (error) {
        console.error(`login error: ${error.message}`);

        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        });
    };

};

export {
    register,
    login
};