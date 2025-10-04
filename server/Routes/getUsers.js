import { Router } from "express";
import { getUsers } from "../controller/User.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/users", protectedRoute, getUsers);

export default router;
