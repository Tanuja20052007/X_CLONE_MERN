import { User } from "../models/User.js";
import jwt from "jsonwebtoken"
import { generateCookieandSetToken } from "../lib/utils/gnereateToken.js"

import bcrypt from "bcryptjs"
export const signup = async (req, res) => {
    try {
        const { fullname, password, username, email } = req.body;
        console.log(fullname)
        console.log(password)
        console.log(username)
        console.log(email)
        // Sanitize inputs
        if (!fullname || !password || !username || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate Email
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid Email Format" });
        }

        // Check for Existing Username
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // Check for Existing Email
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ error: "Email is already taken" });
        }

        // Validate Password
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Password Hashing
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create New User
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            username
        });

        // Save New User to Database
        await newUser.save();

        // Generate Token and Set Cookie
        generateCookieandSetToken(newUser._id, res);

        // Send Response with User Data
        return res.status(201).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg,
            followers: newUser.followers,
            following: newUser.following
        });
    } catch (e) {
        console.error(`Error occurred during signup: ${e.message}`, e);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = await User.findOne({ username });
        const isPasswordCorrect = bcrypt.compare(password, newUser?.password || "")
        if (!newUser || !isPasswordCorrect) {
            res.status(400).json({ error: "Invalid Username or password" })
        }
        console.log(newUser)
        generateCookieandSetToken(newUser._id, res);
        res.json({
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            profileImg: newUser.profileImg,
            coverImg: newUser.coverImg,
            followers: newUser.followers,
            following: newUser.following

        })
    }
    catch (e) {
        console.log(`Error happend in the login controller ${e.message}`)
    }

}
export const logout = (req, res) => {

    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out succesfully !" })
    }
    catch (e) {
        console.log("Error in logout controller ", e.message)
        res.status
            (500).json({ error: "Error in logout controller" })
    }

}

export const getMe = async (req, res) => {
    try {
        console.log(req.user._id)
        const user = await User.findById(req.user._id).select("-password");
        console.log(user)
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }

}