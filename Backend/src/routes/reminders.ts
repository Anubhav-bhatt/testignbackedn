import { Router } from "express";
import { createReminder, deleteReminder, getReminders } from "../controllers/reminderController";

const router = Router();

router.get("/", getReminders);
router.post("/", createReminder);
router.delete("/:id", deleteReminder);

export default router;
