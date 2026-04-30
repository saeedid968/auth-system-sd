import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { adminController } from "../controllers/adminController.js";

const router = express.Router();

router.get(
    "/dashboard",
    protect,
    authorizeRoles("admin"),
    adminController
);

export default router;