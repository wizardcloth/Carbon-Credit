import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authCallback } from "../controller/auth.Controller.js";

let router = Router();

router.post("/authCallback", protectRoute, authCallback);

export default router;
