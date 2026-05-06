import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import connectDB from './config/db.js';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
connectDB();

const PORT = process.env.PORT || 5000;

const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");
const allowedOrigins = [
    "http://localhost:5173",
    "https://auth-system-sd-frontend.vercel.app",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
].filter(Boolean).map(normalizeOrigin);

app.use(cors({
    origin: function (origin, callback) {
        // !origin allow karta hai server-to-server ya Postman requests ko
        const normalizedOrigin = normalizeOrigin(origin);

        if (!origin || allowedOrigins.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
