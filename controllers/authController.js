import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";


const getCookieOptions = (req, expires) => {
    const isSecureRequest =
        req.secure || req.headers["x-forwarded-proto"] === "https";

    return {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: isSecureRequest ? "none" : "lax",
        expires,
        path: "/"
    };
};

const sendTokenResponse = (user, statusCode, req, res) => {
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res
        .status(statusCode)
        .cookie(
            "token",
            token,
            getCookieOptions(req, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        )
        .json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
};

export const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    const user = await User.create({
        name, email, password
    });
    if (user) {
        sendTokenResponse(user, 201, req, res);
    }
})

export const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        sendTokenResponse(user, 200, req, res);
    }
    else {
        res.status(401).json({
            message: "Invalid email or password"
        });
    }
});

export const logoutUser = (req, res) => {

    res.cookie("token", "", getCookieOptions(req, new Date(0)));

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });

};

export const forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Professional HTML Template
    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
            <h2 style="color: #4F46E5; text-align: center;">MERN Auth Project</h2>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 16px; color: #374151;">Hi ${user.name},</p>
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">
                We received a request to reset the password for your account. If you did not make this request, you can safely ignore this email. If you did request a password reset, please click the "Reset Your Password" button to proceed.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                   Reset Your Password
                </a>
            </div>
            <p style="font-size: 14px; color: #6B7280;">
                This email is valid for 10 minutes only.
            </p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="font-size: 12px; color: #9CA3AF; text-align: center;">
                © 2026 MERN Auth Project. Karachi, Pakistan.
            </p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message: `Please use this link to reset: ${resetUrl}`, // Plain text fallback
            html: htmlMessage, // HTML version
        });

        res.status(200).json({ success: true, message: "Professional email sent!" });
    } catch (err) {
        console.log("NODEMAILER ERROR:", err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: "Email could not be sent" });
    }
});


export const resetPassword = async (req, res) => {

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired token"
        });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
        success: true,
        message: "Password reset successful"
    });

};

export const updatePassword = asyncHandler(async (req, res) => {
    // 1. User ko DB se fetch karein (password select karein kyunke wo models mein default hidden hota hai)
    const user = await User.findById(req.user.id).select("+password");

    // 2. Check karein ke current password sahi hai
    const isMatch = await user.matchPassword(req.body.oldPassword);
    if (!isMatch) {
        return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 3. Naya password set karein
    user.password = req.body.newPassword;
    await user.save();

    // 4. Token dubara bhein (Security ke liye)
    sendTokenResponse(user, 200, req, res);
});