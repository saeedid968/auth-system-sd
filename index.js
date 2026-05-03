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
app.use(cors({
    origin: "https://your-frontend-link.vercel.app", 
    credentials: true
}));
// const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173,http://127.0.0.1:5173")
//     .split(",")
//     .map((origin) => origin.trim())
//     .filter(Boolean);

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             return callback(null, true);
//         }

//         return callback(new Error(`CORS blocked for origin: ${origin}`));
//     },
//     credentials: true
// }));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
