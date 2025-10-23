import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import {connectDB} from "./config/db.js";
import users from "./Routes/User.Routes.js";
import authRoutes from "./Routes/auth.Route.js";
import emissionsRoutes from "./Routes/emissions.Route.js"
import farmersRoutes from "./Routes/farmers.Route.js"
import adminRoute from "./Routes/admin.Routes.js";
const app = express();

dotenv.config();

//middleware
// hello
app.use(express.json());
app.use(bodyParser.json());
app.use(
    cors({
        origin: process.env.Origin,
        // origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        preflightContinue: false,
    })
);

//routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/users", users);
app.use('/api/emissions', emissionsRoutes);
app.use('/api/farmers', farmersRoutes);



app.get("/", (req, res) => res.send("Serverless Express API"));




app.listen(3000, async () => {
await connectDB();
    console.log("Server is running on port 3000");
});

export default async function handler(req, res) {
    await connectDB();
    app(req, res);
}
