import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
    },
    { timestamps: true }
);

export const User_email = mongoose.model("User_email", userSchema);