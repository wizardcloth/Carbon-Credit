import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import {connectDB} from "./config/db.js";
import users from "./Routes/getUsers.js"
import authRoutes from "./Routes/authRoute.js";
import emissionsRoutes from "./Routes/emissions-api.js"
import farmersRoutes from "./Routes/farmers-api.js"

const app = express();

dotenv.config();

//middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(
    cors({
        // origin: "https://carbon-credit-fawn.vercel.app",
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
app.use('/api/emissions', emissionsRoutes);
app.use('/api/farmers', farmersRoutes);



app.get("/", (req, res) => res.send("Serverless Express API"));



// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     error: 'Endpoint not found'
//   });
// });


app.listen(3000, async () => {
await connectDB();
    console.log("Server is running on port 3000");
});

export default async function handler(req, res) {
    await connectDB();
    app(req, res);
}
