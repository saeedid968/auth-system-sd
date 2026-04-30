import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";


const connectDB = asyncHandler(async () => {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");
});

export default connectDB;