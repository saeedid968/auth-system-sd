import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";


export const getUserProfile = asyncHandler(async (req, res) => {

    res.json({
        user: req.user
    });
});

export const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
        return res.status(400).json({
            message: "old password is incorrect"
        });
    };
    user.password = newPassword;
    await user.save();
    res.json({
        success: true,
        message: "Password updated successfully"
    })
});