import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { authCallback } from "../controller/auth.Contoller.js";

let router = Router();

router.post("/authCallback", protectedRoute, authCallback);

export default router;
