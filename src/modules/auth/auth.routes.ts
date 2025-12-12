import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();
const { signupUser, signinUser } = authController;

router.post("/signup", signupUser);
router.post("/signin", signinUser);

export const authRouter = router;
