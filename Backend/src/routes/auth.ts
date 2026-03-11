import { Router } from "express";
import { login, signup, sendOtp } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/send-otp", sendOtp);

export default router;
