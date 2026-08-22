import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status"
import { User } from "../models/userModel.js";

const register = async (req, res) => {
    try {
        const {name, username, password} = req.body;

        const existingUser = await User.findOne({ username });

        console.log(`user: ${existingUser}`);

        if (existingUser){
            return res.status(httpStatus.CONFLICT).json({
                success: false,
                message: "User already exists"
            });
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            password: hashedPassword
        });

        res.status(httpStatus.OK).json({
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
        console.log(`error: ${error.message}`);
    }

};

const login = async (req, res) => {
    try {
        const { username, password} = req.body;

        const user = await User.findOne({ username });

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

        res.status(httpStatus.OK).json({
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
        console.log(`error: ${error.message}`);
    };

};

export {
    register,
    login
};