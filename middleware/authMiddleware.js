import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {

    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return res.status(401).json({
            message: "Not authorized"
        });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
});