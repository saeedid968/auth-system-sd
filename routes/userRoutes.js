import express from "express";
import { getUserProfile, changePassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.put("/change-password", protect, changePassword);

export default router;