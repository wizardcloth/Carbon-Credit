import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import users from "./Routes/User.Routes.js";
import authRoutes from "./Routes/auth.Route.js";
import emissionsRoutes from "./Routes/emissions.Route.js";
import farmersRoutes from "./Routes/farmers.Route.js";
import adminRoute from "./Routes/admin.Routes.js";
import initializeEarthEngine from './earthEngine.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(
    cors({
        origin: process.env.Origin,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        preflightContinue: false,
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/users", users);
app.use('/api/emissions', emissionsRoutes);
app.use('/api/farmers', farmersRoutes);

app.get("/", (req, res) => res.send("Serverfull Express API"));

const startServer = async () => {
    try {
        await connectDB();
        console.log('✓ Database connected');

        await initializeEarthEngine();
        console.log('✓ Earth Engine ready');

        app.listen(3000, () => {
            console.log('✓ Server is running on port 3000');
            console.log('✓ All services initialized successfully');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

export default async function handler(req, res) {
    app(req, res);
}
