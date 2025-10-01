import express from "express";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./Routes/authRoute.js";
import cors from "cors";

import users from "./Routes/getUsers.js"

const app = express();

dotenv.config();

//middleware
app.use(express.json());
app.use(
    cors({
        // origin: "http://localhost:5173",
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        preflightContinue: false,
    })
);

//routes

app.use("/api/auth", authRoutes);
app.use("/api/users", users);


app.get("/", (req, res) => res.send("Serverless Express API"));

app.listen(3000, async () => {
await connectDB();
    console.log("Server is running on port 3000");
});

export default async function handler(req, res) {
    await connectDB();
    app(req, res);
}
