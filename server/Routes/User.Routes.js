import { Router } from "express";
import { getUsers } from "../controller/User.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();

router.get("/users", protectRoute, getUsers);

export default router;
