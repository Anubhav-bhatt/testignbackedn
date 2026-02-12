import { Router } from "express";
import { chatWithAI, closeCase, createCase, getCaseAnalysis, getCaseById, getCases, updateCaseDeal, updateHearingDate } from "../controllers/caseController";

const router = Router();

router.get("/", getCases);
router.post("/", createCase);
router.post("/chat", chatWithAI);
router.get("/:id", getCaseById);
router.get("/:id/analysis", getCaseAnalysis);
router.patch("/:id/hearing", updateHearingDate);
router.patch("/:id/deal", updateCaseDeal);
router.post("/:id/close", closeCase);

export default router;
