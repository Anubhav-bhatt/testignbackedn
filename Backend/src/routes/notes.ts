import { Router } from "express";
import { createNote, deleteNote, getNotes } from "../controllers/noteController";

const router = Router();

router.get("/", getNotes);
router.post("/", createNote);
router.delete("/:id", deleteNote);

export default router;
