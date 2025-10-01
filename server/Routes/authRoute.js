import { Router } from "express";
import {authCallbackGoogle} from "../controller/auth.Contoller.js";
import { authCallbackEmail } from "../controller/auth.Contoller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

let router = Router();

router.post("/authCallback/google",protectedRoute,authCallbackGoogle);
router.post("/authCallback/email",protectedRoute,authCallbackEmail);

export default router;