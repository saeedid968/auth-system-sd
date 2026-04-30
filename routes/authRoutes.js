import express from 'express';
import { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, updatePassword } from "../controllers/authController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/update-password", protect, updatePassword);

export default router;